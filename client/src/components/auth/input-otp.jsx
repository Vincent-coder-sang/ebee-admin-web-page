import React from 'react';

export const InputOTP = ({ value, onChange, length, placeholder, className }) => {
    const handleInputChange = (e, index) => {
        const newValue = value.split('');
        newValue[index] = e.target.value;
        onChange(newValue.join('')); // Update the value with the changed character
    };

    const handleKeyDown = (e, index) => {
        // Allow only numeric input and handle backspace
        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace') {
            e.preventDefault();
        }
        if (e.key === 'Backspace' && index > 0) {
            document.getElementById(`otp-input-${index - 1}`).focus();
        }
    };

    const handleFocusNext = (e, index) => {
        if (e.target.value.length === 1 && index < length - 1) {
            document.getElementById(`otp-input-${index + 1}`).focus();
        }
    };

    return (
        <div className="flex justify-between space-x-2 mb-6">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    maxLength="1"
                    value={value[index] || ''}
                    onChange={(e) => handleInputChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                    onBlur={(e) => handleFocusNext(e, index)}
                    className={`${className} text-center w-12 h-12 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder={placeholder}
                />
            ))}
        </div>
    );
};
