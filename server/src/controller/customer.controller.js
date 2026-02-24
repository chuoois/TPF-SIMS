const { randomUUID } = require("crypto");
const { AppDataSource } = require("../config/db");
const { CustomerProfileRepo, SystemLogRepo } = require("./base.controller");

/**
 * Customer Controller
 * Quản lý hồ sơ khách hàng (Sales, Owner)
 *
 * Created By: ThinhBui
 * Created Date: 23/02/2026
 */

// Helper ghi SystemLog
const writeSystemLog = async (manager, { description, actorAccount }) => {
    const logRepo = manager
        ? manager.getRepository("SystemLog")
        : SystemLogRepo;
    await logRepo.save({
        pk_system_log_id: randomUUID(),
        description,
        modified_by: actorAccount?.email ?? "unknown",
        userAccount: actorAccount
            ? { pk_user_account_id: actorAccount.id }
            : null,
    });
};

// Sinh customer_code tự động: KH + 8 ký tự hex
const generateCustomerCode = () =>
    "KH" + randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();

/**
 * Create Customer Profile
 * POST /sales/customers
 * Role: SALES, OWNER
 */
const createCustomer = async (req, res) => {
    try {
        const {
            fullName,
            phoneNumber,
            address,
            email,
            gender,
            dob,
            customerType,
            note,
        } = req.body;

        if (!fullName) {
            return res
                .status(400)
                .json({ message: "Vui lòng nhập họ tên khách hàng" });
        }

        const customer = CustomerProfileRepo.create({
            pk_customer_id: randomUUID(),
            customer_code: generateCustomerCode(),
            full_name: fullName,
            phone_number: phoneNumber || null,
            address: address || null,
            email: email || null,
            gender: gender || null,
            dob: dob ? new Date(dob) : null,
            customer_type: customerType || null,
            note: note || null,
        });

        const saved = await CustomerProfileRepo.save(customer);

        await writeSystemLog(AppDataSource.manager, {
            description: `Tạo hồ sơ khách hàng: ${fullName} (${saved.customer_code})`,
            actorAccount: req.user,
        });

        return res.status(201).json({
            message: "Tạo hồ sơ khách hàng thành công",
            customer: {
                pk_customer_id: saved.pk_customer_id,
                customer_code: saved.customer_code,
                full_name: saved.full_name,
            },
        });
    } catch (error) {
        console.error("Create Customer Error:", error);
        return res
            .status(500)
            .json({ message: "Lỗi server khi tạo hồ sơ khách hàng" });
    }
};

/**
 * Update Customer Profile
 * PUT /sales/customers/:id
 * Role: SALES, OWNER
 */
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fullName,
            phoneNumber,
            address,
            email,
            gender,
            dob,
            customerType,
        } = req.body;

        const customer = await CustomerProfileRepo.findOne({
            where: { pk_customer_id: id },
        });

        if (!customer) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy hồ sơ khách hàng" });
        }

        if (fullName !== undefined) customer.full_name = fullName;
        if (phoneNumber !== undefined) customer.phone_number = phoneNumber;
        if (address !== undefined) customer.address = address;
        if (email !== undefined) customer.email = email;
        if (gender !== undefined) customer.gender = gender;
        if (dob !== undefined) customer.dob = dob ? new Date(dob) : null;
        if (customerType !== undefined) customer.customer_type = customerType;

        await CustomerProfileRepo.save(customer);

        await writeSystemLog(AppDataSource.manager, {
            description: `Cập nhật hồ sơ khách hàng: ${customer.full_name} (${customer.customer_code}) (ID: ${id})`,
            actorAccount: req.user,
        });

        return res.status(200).json({ message: "Cập nhật hồ sơ thành công" });
    } catch (error) {
        console.error("Update Customer Error:", error);
        return res
            .status(500)
            .json({ message: "Lỗi server khi cập nhật hồ sơ khách hàng" });
    }
};

/**
 * Add / Update Special Note
 * PATCH /sales/customers/:id/note
 * Role: SALES, OWNER
 * Ghi chú đặc biệt: ngày giao, màu sơn, vị trí lắp đặt,...
 */
const addSpecialNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        if (note === undefined || note === null) {
            return res
                .status(400)
                .json({ message: "Vui lòng cung cấp nội dung ghi chú" });
        }

        const customer = await CustomerProfileRepo.findOne({
            where: { pk_customer_id: id },
        });

        if (!customer) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy hồ sơ khách hàng" });
        }

        customer.note = note;
        await CustomerProfileRepo.save(customer);

        await writeSystemLog(AppDataSource.manager, {
            description: `Cập nhật ghi chú đặc biệt cho KH: ${customer.full_name} (${customer.customer_code}) (ID: ${id})`,
            actorAccount: req.user,
        });

        return res
            .status(200)
            .json({ message: "Ghi chú đã được cập nhật", note });
    } catch (error) {
        console.error("Add Special Note Error:", error);
        return res
            .status(500)
            .json({ message: "Lỗi server khi cập nhật ghi chú" });
    }
};

/**
 * Get All Customers (with optional search by name/phone)
 * GET /sales/customers
 * Role: SALES, OWNER
 */
const getAllCustomers = async (req, res) => {
    try {
        const { search } = req.query;

        let customers;

        if (search) {
            customers = await CustomerProfileRepo.createQueryBuilder("c")
                .where("c.full_name LIKE :search OR c.phone_number LIKE :search OR c.customer_code LIKE :search", {
                    search: `%${search}%`,
                })
                .orderBy("c.created_at", "DESC")
                .getMany();
        } else {
            customers = await CustomerProfileRepo.find({
                order: { created_at: "DESC" },
            });
        }

        return res.status(200).json(customers);
    } catch (error) {
        console.error("Get All Customers Error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * Get Customer By ID
 * GET /sales/customers/:id
 * Role: SALES, OWNER
 */
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await CustomerProfileRepo.findOne({
            where: { pk_customer_id: id },
        });

        if (!customer) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy hồ sơ khách hàng" });
        }

        return res.status(200).json(customer);
    } catch (error) {
        console.error("Get Customer By ID Error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    createCustomer,
    updateCustomer,
    addSpecialNote,
    getAllCustomers,
    getCustomerById,
};
