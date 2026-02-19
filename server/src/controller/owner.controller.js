const bcrypt = require("bcrypt");
const { AppDataSource } = require("../config/db");
const {
    UserRepo,
    UserProfileRepo,
    UserRoleRepo,
} = require("./base.controller");
const { randomUUID } = require("crypto");

/**
 * Create a new account with profile (Owner only)
 */
const createAccount = async (req, res) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const {
            email,
            password,
            roleCode,
            fullName,
            phoneNumber,
            dob,
            gender,
            salaryType,
        } = req.body;

        // Check if email already exists
        const existingUser = await UserRepo.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Get Role
        const role = await UserRoleRepo.findOne({
            where: { role_code: roleCode || "" },
        }); // Default to  if not specified
        if (!role) {
            return res.status(400).json({ message: "Role không hợp lệ" });
        }

        // Create UserAccount
        const newUserAccount = UserRepo.create({
            pk_user_account_id: randomUUID(),
            email,
            password_hash: passwordHash,
            role: role,
            status: 1, // Active
        });

        const savedAccount = await queryRunner.manager
            .getRepository("UserAccount")
            .save(newUserAccount);

        // Create UserProfile
        const newUserProfile = UserProfileRepo.create({
            pk_user_profile_id: randomUUID(),
            account: savedAccount,
            full_name: fullName,
            phone_number: phoneNumber,
            dob: dob ? new Date(dob) : null,
            gender: gender, // Verify type logic if needed (e.g. 0/1)
            salary_type: salaryType,
        });

        await queryRunner.manager.getRepository("UserProfile").save(newUserProfile);

        // Commit Transaction
        await queryRunner.commitTransaction();

        return res.status(201).json({
            message: "Tạo tài khoản thành công",
            account: {
                id: savedAccount.pk_user_account_id,
                email: savedAccount.email,
                role: role.role_code,
            },
        });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Create Account Error:", error);
        return res.status(500).json({ message: "Lỗi server khi tạo tài khoản" });
    } finally {
        await queryRunner.release();
    }
};

/**
 * Get All Accounts with Profiles
 */
const getAllAccounts = async (req, res) => {
    try {
        const accounts = await UserRepo.find({
            relations: ["profile", "role"],
            select: {
                pk_user_account_id: true,
                email: true,
                status: true,
                timestamp: true,
                role: {
                    role_code: true,
                    role_name: true,
                },
                profile: {
                    full_name: true,
                    phone_number: true,
                    dob: true,
                    gender: true,
                    salary_type: true
                },
            },
        });

        return res.status(200).json(accounts);
    } catch (error) {
        console.error("Get All Accounts Error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * Get Account By ID
 */
const getAccountById = async (req, res) => {
    try {
        const { id } = req.params;
        const account = await UserRepo.findOne({
            where: { pk_user_account_id: id },
            relations: ["profile", "role"],
        });

        if (!account) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản" });
        }

        // Remove sensitive data if needed, though usually handled by select or DTO
        delete account.password_hash;

        return res.status(200).json(account);
    } catch (error) {
        console.error("Get Account By ID Error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * Update Account (Status) and Profile
 */
const updateAccount = async (req, res) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { id } = req.params;
        const { status, roleCode, fullName, phoneNumber, dob, gender, salaryType } =
            req.body;

        const account = await UserRepo.findOne({
            where: { pk_user_account_id: id },
            relations: ["profile"],
        });

        if (!account) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản" });
        }

        // Update Account fields
        if (status !== undefined) account.status = status;

        if (roleCode) {
            const role = await UserRoleRepo.findOne({
                where: { role_code: roleCode },
            });
            if (role) {
                account.role = role;
            }
        }

        await queryRunner.manager.getRepository("UserAccount").save(account);

        // Update Profile fields
        if (account.profile) {
            if (fullName) account.profile.full_name = fullName;
            if (phoneNumber) account.profile.phone_number = phoneNumber;
            if (dob) account.profile.dob = new Date(dob);
            if (gender !== undefined) account.profile.gender = gender;
            if (salaryType !== undefined) account.profile.salary_type = salaryType;

            await queryRunner.manager.getRepository("UserProfile").save(account.profile);
        }

        await queryRunner.commitTransaction();

        return res.status(200).json({ message: "Cập nhật thành công" });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Update Account Error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    } finally {
        await queryRunner.release();
    }
};

/**
 * Delete Account
 */
const deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await UserRepo.delete(id);

        if (result.affected === 0) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy tài khoản để xóa" });
        }

        return res.status(200).json({ message: "Xóa tài khoản thành công" });
    } catch (error) {
        console.error("Delete Account Error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    createAccount,
    getAllAccounts,
    getAccountById,
    updateAccount,
    deleteAccount,
};
