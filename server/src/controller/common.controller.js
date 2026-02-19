const bcrypt = require("bcrypt");
const { UserRepo, UserProfileRepo } = require("./base.controller");

/**
 * Get User Profile
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await UserRepo.findOne({
            where: { pk_user_account_id: userId },
            relations: ["profile", "role"],
            select: {
                pk_user_account_id: true,
                email: true,
                status: true,
                role: {
                    role_code: true,
                    role_name: true,
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Get Profile Error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * Update User Profile
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, phone_number, dob, gender } = req.body;

        const user = await UserRepo.findOne({
            where: { pk_user_account_id: userId },
            relations: ["profile"],
        });

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        // Nếu chưa có profile thì tạo mới, có rồi thì update
        if (!user.profile) {
            const newProfile = UserProfileRepo.create({
                full_name,
                phone_number,
                dob,
                gender,
                account: user,
            });
            await UserProfileRepo.save(newProfile);
        } else {
            // Chỉ update các trường được phép
            user.profile.full_name = full_name ?? user.profile.full_name;
            user.profile.phone_number = phone_number ?? user.profile.phone_number;
            user.profile.dob = dob ?? user.profile.dob;
            user.profile.gender = gender ?? user.profile.gender;

            await UserProfileRepo.save(user.profile);
        }

        return res.status(200).json({ message: "Cập nhật hồ sơ thành công" });
    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * Change Password
 */
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        const user = await UserRepo.findOne({
            where: { pk_user_account_id: userId },
        });

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password_hash = hashedPassword;
        await UserRepo.save(user);

        return res.status(200).json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
};
