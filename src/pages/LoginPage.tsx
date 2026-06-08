import { ThirdwebSignIn } from "../components/auth/ThirdwebSignIn";
import { images } from "../config/assets";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center overflow-auto bg-[#0B021C] py-8"
      style={{
        backgroundImage: `url(${images.backgroundPixels}), url(${images.backgroundCTA})`,
        backgroundSize: "auto, cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">Sign In</h1>
          <p className="text-gray-400 text-sm">Connect your wallet or social account</p>
        </div>
        <ThirdwebSignIn />
      </div>
    </div>
  );
}
