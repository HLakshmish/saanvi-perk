const authService = require("./auth.service");

class AuthController {
    async login(request, reply) {
        try {
            const { email, password } = request.body;
            
            const user = await authService.login(email, password);

            // Generate JWT Token
            const token = request.server.jwt.sign({ 
                userId: user.userId, 
                email: user.email, 
                role: user.role, 
                companyId: user.companyId,
                permissions: user.permissions || []
            });

            return reply.status(200).send({
                success: true,
                message: "Login successful",
                token: token,
                data: user
            });
        } catch (error) {
            return reply.status(401).send({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AuthController();
