/** @format */

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import { registerUser } from "../../features/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";

const AuthRegister = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { registerStatus, registerError } = useSelector((state) => state.auth);

	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = (values) => {
		dispatch(registerUser(values));
	};

	useEffect(() => {
		if (registerStatus === "success") {
			navigate('/auth/login');
		}
	}, [registerStatus, navigate]);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const validationSchema = Yup.object({
		name: Yup.string().required("Name required"),
		email: Yup.string()
			.email("Invalid email format")
			.required("Email required"),
		phoneNumber: Yup.string().required("Phone number required"),
		password: Yup.string().required("Password required"),
	});

	return (
		// <div className='flex justify-center items-center min-h-screen bg-gray-50'>
			<div className='max-w-sm w-full bg-white p-6 rounded-lg border'>
				<h2 className='text-xl font-semibold text-center mb-4 text-gray-800'>Register</h2>
				<Formik
					initialValues={{ name: "", email: "", phoneNumber: "", password: "" }}
					validationSchema={validationSchema}
					onSubmit={handleSubmit}
				>
					{({ values, handleChange, handleBlur }) => (
						<Form className='space-y-4'>
							{/* Name Field */}
							<div>
								<Label htmlFor='name' className='text-sm'>Name</Label>
								<Field
									as={Input}
									id='name'
									type='text'
									name='name'
									placeholder='Enter name'
									onChange={handleChange}
									onBlur={handleBlur}
									value={values.name}
									className='text-sm'
								/>
								<ErrorMessage name='name'>
									{(msg) => <div className='text-red-500 text-xs mt-1'>{msg}</div>}
								</ErrorMessage>
							</div>

							{/* Email Field */}
							<div>
								<Label htmlFor='email' className='text-sm'>Email</Label>
								<Field
									as={Input}
									id='email'
									type='email'
									name='email'
									placeholder='Enter email'
									onChange={handleChange}
									onBlur={handleBlur}
									value={values.email}
									className='text-sm'
								/>
								<ErrorMessage name='email'>
									{(msg) => <div className='text-red-500 text-xs mt-1'>{msg}</div>}
								</ErrorMessage>
							</div>

							{/* Phone Field */}
							<div>
								<Label htmlFor='phoneNumber' className='text-sm'>Phone Number</Label>
								<Field
									as={Input}
									id='phoneNumber'
									type='text'
									name='phoneNumber'
									placeholder='Enter phone number'
									onChange={handleChange}
									onBlur={handleBlur}
									value={values.phoneNumber}
									className='text-sm'
								/>
								<ErrorMessage name='phoneNumber'>
									{(msg) => <div className='text-red-500 text-xs mt-1'>{msg}</div>}
								</ErrorMessage>
							</div>

							{/* Password Field */}
							<div>
								<Label htmlFor='password' className='text-sm'>Password</Label>
								<div className='relative'>
									<Field
										as={Input}
										id='password'
										type={showPassword ? "text" : "password"}
										name='password'
										placeholder='Enter password'
										onChange={handleChange}
										onBlur={handleBlur}
										value={values.password}
										className='text-sm pr-10'
									/>
									<span
										className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-sm'
										onClick={togglePasswordVisibility}
									>
										{showPassword ? <HiEyeOff /> : <HiEye />}
									</span>
								</div>
								<ErrorMessage name='password'>
									{(msg) => <div className='text-red-500 text-xs mt-1'>{msg}</div>}
								</ErrorMessage>
							</div>

							<div className='text-center'>
								<Link to='/auth/login' className='text-xs text-blue-600 hover:underline'>
									Already have an account?
								</Link>
							</div>

							{registerStatus === "pending" ? (
								<Button disabled className='w-full text-sm py-2'>
									Creating account...
								</Button>
							) : (
								<Button type='submit' className='w-full text-sm py-2'>
									Register
								</Button>
							)}

							{registerStatus === "rejected" && (
								<div className='text-red-500 text-xs text-center mt-2'>
									{registerError}
								</div>
							)}
						</Form>
					)}
				</Formik>
			</div>
		// </div>
	);
};

export default AuthRegister;