"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LeftPanelBrandAcademicImageryHiddenOnMobile } from "@/components/imports/注册与角色选择-1/注册与角色选择";
import { createClient } from "@/lib/supabase/client";
import { Check, Loader2, GraduationCap, Presentation, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "student" | "teacher" | "parent";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selectedRole, setSelectedRole] = useState<Role>("student");
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: selectedRole,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Navigate based on role
      if (selectedRole === "student") {
        router.push("/onboarding");
      } else if (selectedRole === "teacher") {
        router.push("/teacher");
      } else {
        router.push("/parent");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-white">
      {/* Left side: The beautiful Figma illustration */}
      <div className="hidden lg:flex w-1/2 flex-col">
        <LeftPanelBrandAcademicImageryHiddenOnMobile />
      </div>

      {/* Right side: Native fully-interactive React Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 overflow-y-auto">
        <div className="w-full max-w-[500px] flex flex-col gap-10">
          
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] font-semibold text-[#191c1d] tracking-tight">Create your account</h1>
            <p className="text-[#424750] text-base">Select your role to get started.</p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-10">
            {/* Role Selection Grid */}
            <div className="grid grid-cols-3 gap-3">
              <RoleCard 
                role="student" 
                title="Student" 
                selected={selectedRole === "student"} 
                onClick={() => setSelectedRole("student")}
                icon={<GraduationCap className={cn("w-6 h-6", selectedRole === "student" ? "text-[#003461]" : "text-[#424750]")} />}
              />
              <RoleCard 
                role="teacher" 
                title="Teacher" 
                selected={selectedRole === "teacher"} 
                onClick={() => setSelectedRole("teacher")}
                icon={<Presentation className={cn("w-6 h-6", selectedRole === "teacher" ? "text-[#003461]" : "text-[#424750]")} />}
              />
              <RoleCard 
                role="parent" 
                title="Parent" 
                selected={selectedRole === "parent"} 
                onClick={() => setSelectedRole("parent")}
                icon={<Users className={cn("w-6 h-6", selectedRole === "parent" ? "text-[#003461]" : "text-[#424750]")} />}
              />
            </div>

            {/* Input Fields */}
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                <InputField label="First Name" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
                <InputField label="Last Name" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
              </div>
              
              <InputField label="Email Address" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" />
              
              <div className="flex flex-col gap-2">
                <InputField label="Password" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                <p className="text-xs text-[#424750]">Must be at least 8 characters long.</p>
              </div>

              {error && (
                <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full h-[52px] bg-[#003461] hover:bg-[#002b50] active:scale-[0.99] transition-all text-white font-semibold rounded-full shadow-[0px_4px_6px_rgba(0,43,135,0.08)] flex items-center justify-center disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="pt-6 border-t border-[#e7e8e9] text-center">
            <p className="text-[#424750]">
              Already have an account?{" "}
              <button onClick={() => router.push("/login")} className="text-[#003461] font-semibold hover:underline">
                Sign in here
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

// Subcomponents for the form to keep it clean

function RoleCard({ role, title, selected, onClick, icon }: { role: string, title: string, selected: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 gap-3 rounded-xl transition-all h-[132px]",
        selected 
          ? "bg-[rgba(211,228,255,0.3)] shadow-[0px_4px_12px_0px_rgba(0,43,135,0.08)] ring-2 ring-[#003461] ring-inset" 
          : "bg-[#f8f9fa] border border-[#c2c6d1] hover:bg-gray-100"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center",
        selected ? "bg-[#003461]/10" : "bg-[#e1e3e4]"
      )}>
        {icon}
      </div>
      <span className={cn("font-semibold text-sm", selected ? "text-[#191c1d]" : "text-[#424750]")}>
        {title}
      </span>
      
      {/* Checkmark indicator */}
      <div className={cn(
        "absolute bottom-[14px] right-[14px] w-4 h-4 rounded-full flex items-center justify-center transition-all",
        selected ? "bg-[#003461] text-white scale-100" : "border border-gray-400 bg-white scale-0 opacity-0"
      )}>
        <Check className="w-2.5 h-2.5" strokeWidth={3} />
      </div>
    </button>
  );
}

function InputField({ label, id, type = "text", value, onChange, placeholder }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-sm font-semibold text-[#191c1d]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-12 bg-[#f8f9fa] border border-[#c2c6d1] rounded-lg px-4 text-[#191c1d] placeholder:text-[#727781] focus:outline-none focus:ring-2 focus:ring-[#003461] focus:border-transparent transition-all"
      />
    </div>
  );
}