const User = require("../models/user")

// Lấy thông tin hồ sơ cá nhâb

const getAll = async (req, res) => {
    try {
        // Lấy tất cả user và loại bỏ trường password
        const users = await User.find({}).select('-password');
        
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng nào" });
        }
        
        res.status(200).json({ 
            success: true,
            count: users.length,
            data: users 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

// Lấy thông tin hồ sơ cá nhâb

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password')
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        res.status(201).json({ data: user })


    }
    catch (error) {
        res.status(500).json({ message: error.message })

    }
}
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password')
        if (user) {
            user.userName = req.body.userName || user.userName;
            // user.email = req.body.email || user.email;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.address = req.body.address || user.address;
            // if (req.body.role) {
            //     if (req.body.role === "Admin") {
            //         user.isAdmin = true;
            //     } else if (req.body.role === "User") {
            //         user.isAdmin = false;
            //     }
            // }

            const updatedUser = await user.save();


            res.status(200).json({
                // _id: updatedUser._id,
                // username: updatedUser.username,
                // email: updatedUser.email,
                // phoneNumber: updatedUser.phoneNumber,
                // address: updatedUser.address,
                // isAdmin: updatedUser.isAdmin,
                success: true,
                data: updatedUser
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    getUserProfile,
    updateUserProfile,
    deleteUser,
    getAll
}