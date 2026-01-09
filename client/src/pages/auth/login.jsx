import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { loginUser } from "../../features/slices/authSlice";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AuthLogin = () => {
	const dispatch = useDispatch();
	const { loginStatus } = useSelector((state) => state.auth);
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = (values) => {
		dispatch(loginUser(values));
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const validationSchema = Yup.object({
		email: Yup.string()
			.email("Invalid email format")
			.required("Email required"),
		password: Yup.string().required("Password required"),
	});

	return (
		// <div className='flex justify-center items-center min-h-screen bg-gray-50'>
			<div className='max-w-sm w-full bg-white p-6 rounded-lg border'>
				<h2 className='text-xl font-semibold text-center mb-4 text-gray-800'>Admin Login</h2>
				<Formik
					initialValues={{ email: "", password: "" }}
					validationSchema={validationSchema}
					onSubmit={handleSubmit}
				>
					{({ values, handleChange, handleBlur }) => (
						<Form className='space-y-4'>
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
										onClick={togglePasswordVisibility}
										className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-sm'
									>
										{showPassword ? <HiEyeOff /> : <HiEye />}
									</span>
								</div>
								<ErrorMessage name='password'>
									{(msg) => <div className='text-red-500 text-xs mt-1'>{msg}</div>}
								</ErrorMessage>
							</div>

							<div className='flex justify-between text-xs'>
								<Link to='/auth/forgot-password' className='text-blue-600 hover:underline'>
									Forgot password?
								</Link>
								<Link to='/auth/register' className='text-blue-600 hover:underline'>
									Sign up
								</Link>
							</div>

							{loginStatus === "pending" ? (
								<Button disabled className='w-full text-sm py-2'>
									Loading...
								</Button>
							) : (
								<Button type='submit' className='w-full text-sm py-2'>
									Login
								</Button>
							)}
						</Form>
					)}
				</Formik>
			</div>
		// </div>
	);
};

export default AuthLogin;