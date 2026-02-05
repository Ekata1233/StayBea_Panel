export const checkPermission =
  (requiredPermission: string) =>
  (req: any, res: any, next: any) => {
    const user = req.user;

    if (!user?.permissions?.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
