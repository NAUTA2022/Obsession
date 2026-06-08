import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Input, Button } from '../components/ui';
import { useForm } from '../hooks/useForm';
import { authService } from '../services/api/auth.service';
import backgroundPixels from '../assets/images/backgroundPixels.png';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  const token = searchParams.get('token');

  const form = useForm({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setError('No reset token provided. Please request a new password reset.');
    }
  }, [token]);

  const handleFormSubmit = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    try {
      form.setLoading(true);
      setError(null);

      const response = await authService.resetPasswordWithToken(
        token,
        values.newPassword
      );

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        throw new Error(response.message || 'Error resetting password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error resetting password. The token may be invalid or expired.';
      setError(errorMessage);
    } finally {
      form.setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: { newPassword?: string; confirmPassword?: string } = {};

    if (!form.values.newPassword) {
      errors.newPassword = 'Password is required';
    } else if (form.values.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        form.values.newPassword
      )
    ) {
      errors.newPassword =
        'Password must contain uppercase, lowercase, number, and special character';
    }

    if (!form.values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (form.values.newPassword !== form.values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const onSubmit = (e: React.FormEvent) => {
    console.log("🔵 Form submit triggered");
    e.preventDefault();

    const errors = validateForm();
    console.log("🟡 Validation errors:", errors);

    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, message]) => {
        form.setFieldError(field, message);
      });
      return;
    }

    handleFormSubmit(form.values);
  };

  // Página de éxito
  if (isSuccess) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${backgroundPixels})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>

            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Password Reset Successful!
            </h1>

            <p className="text-gray-600 mb-8">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>

            <div className="text-sm text-gray-500 mb-4">
              Redirecting to login page in 3 seconds...
            </div>

            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Go to Login Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Token inválido
  if (!isValidToken) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${backgroundPixels})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>

            <h1 className="text-3xl font-bold mb-4 text-red-600">
              Invalid Reset Link
            </h1>

            <p className="text-gray-600 mb-8">{error}</p>

            <div className="space-y-3">
              <Link to="/forgot-password">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Request New Reset Link
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de reset password
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${backgroundPixels})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Reset Password
          </h2>
          <p className="mt-3 text-gray-600">Enter your new password below</p>
        </div>

        <form className="space-y-6" onSubmit={onSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
          <div className="relative">
            <Input
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
                <Eye className="w-5 h-5" />
          </div>
          </div>

          <div>
          <div className="relative">
            <Input
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
                <Eye className="w-5 h-5" />
          </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-semibold mb-1">Password requirements:</p>
            <ul className="space-y-0.5 text-xs">
              <li>• At least 8 characters long</li>
              <li>• Contains uppercase and lowercase letters</li>
              <li>• Contains at least one number</li>
              <li>• Contains at least one special character (@$!%*?&)</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={form.isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {form.isLoading ? 'Resetting Password...' : 'Reset Password'}
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
