import React from 'react';

export const InputField = React.forwardRef(({ label, error, placeholder, type = "text", icon, ...rest }: any, ref: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</label>
        <div className="relative">
            {icon && <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">{icon}</span>}
            <input 
                type={type} 
                ref={ref}
                placeholder={placeholder} 
                {...rest}
                className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#00B050] focus:bg-white outline-none transition-all`} 
            />
        </div>
        {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
    </div>
));
InputField.displayName = "InputField";