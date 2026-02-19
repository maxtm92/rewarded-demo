export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-radial">
      <div className="w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}
