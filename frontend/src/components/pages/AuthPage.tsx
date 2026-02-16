"use client";
import { useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-[380px] border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
        {/* Header Tab */}
        <div className="bg-black text-white px-3 py-1 self-start text-[10px] font-black uppercase italic mb-6">
          {isLogin
            ? "Status: Authentication_Required"
            : "Status: New_Identity_Creation"}
        </div>

        <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">
          {isLogin ? "User_Login" : "Register_ID"}
        </h2>

        <form className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest opacity-50">
              Username
            </label>
            <input
              type="text"
              className="w-full border-2 border-black p-2 outline-none focus:bg-zinc-50 font-bold text-sm"
              placeholder="UID_000"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest opacity-50">
              Access_Key
            </label>
            <input
              type="password"
              className="w-full border-2 border-black p-2 outline-none focus:bg-zinc-50 font-bold text-sm"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-50">
                Verify_Key
              </label>
              <input
                type="password"
                className="w-full border-2 border-black p-2 outline-none focus:bg-zinc-50 font-bold text-sm"
                placeholder="••••••••"
              />
            </div>
          )}

          <button className="w-full bg-black text-white py-3 font-black uppercase italic hover:bg-zinc-800 transition-all active:translate-y-1 active:shadow-none mt-4 text-sm">
            {isLogin ? ">>> Execute_Login" : ">>> Initialize_ID"}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t-2 border-black border-dotted flex justify-between items-center">
          <span className="text-[9px] font-bold opacity-40 uppercase">
            {isLogin ? "No identity found?" : "Already indexed?"}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-black uppercase underline decoration-2 underline-offset-4 hover:text-zinc-500"
          >
            {isLogin ? "Register_New" : "Back_to_Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
