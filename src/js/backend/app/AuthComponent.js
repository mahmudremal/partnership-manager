import React, { useState } from 'react';

const AuthComponent = () => {
    const [isSignup, setIsSignup] = useState(true);

    return (
        <div className="sg-min-h-screen sg-bg-gray-100 sg-text-gray-900 sg-flex sg-justify-center">
            <div className="sg-max-w-screen-xl sg-m-0 sg-sm:m-10 sg-bg-white sg-shadow sg-sm:rounded-lg sg-flex sg-justify-center sg-flex-1">
                <div className="sg-lg:w-1/2 sg-xl:w-5/12 sg-p-6 sg-sm:p-12">
                    <div>
                        <img 
                            src="https://storage.googleapis.com/devitary-image-host.appspot.com/15846435184459982716-LogoMakr_7POjrN.png"
                            className="sg-w-32 sg-mx-auto" 
                            alt="Logo"
                        />
                    </div>
                    <div className="sg-mt-12 sg-flex sg-flex-col sg-items-center">
                        <h1 className="sg-text-2xl sg-xl:text-3xl sg-font-extrabold">
                            {isSignup ? 'Sign up' : 'Log in'}
                        </h1>
                        <div className="sg-w-full sg-flex-1 sg-mt-8">
                            <div className="sg-flex sg-flex-col sg-items-center">
                                <button
                                    className="sg-w-full sg-max-w-xs sg-font-bold sg-shadow-sm sg-rounded-lg sg-py-3 sg-bg-indigo-100 sg-text-gray-800 sg-flex sg-items-center sg-justify-center sg-transition-all sg-duration-300 sg-ease-in-out sg-focus:outline-none sg-hover:shadow sg-focus:shadow-sm sg-focus:shadow-outline"
                                >
                                    <div className="sg-bg-white sg-p-2 sg-rounded-full">
                                        <svg className="sg-w-4" viewBox="0 0 533.5 544.3">
                                            <path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="#4285f4" />
                                            <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="#34a853" />
                                            <path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="#fbbc04" />
                                            <path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="#ea4335" />
                                        </svg>
                                    </div>
                                    <span className="sg-ml-4">
                                        {isSignup ? 'Sign Up with Google' : 'Log in with Google'}
                                    </span>
                                </button>

                                <button
                                    className="sg-w-full sg-max-w-xs sg-font-bold sg-shadow-sm sg-rounded-lg sg-py-3 sg-bg-indigo-100 sg-text-gray-800 sg-flex sg-items-center sg-justify-center sg-transition-all sg-duration-300 sg-ease-in-out sg-focus:outline-none sg-hover:shadow sg-focus:shadow-sm sg-focus:shadow-outline sg-mt-5"
                                >
                                    <div className="sg-bg-white sg-p-1 sg-rounded-full">
                                        <svg className="sg-w-6" viewBox="0 0 32 32">
                                            <path fillRule="evenodd" d="M16 4C9.371 4 4 9.371 4 16c0 5.3 3.438 9.8 8.207 11.387.602.11.82-.258.82-.578 0-.286-.011-1.04-.015-2.04-3.34.723-4.043-1.609-4.043-1.609-.547-1.387-1.332-1.758-1.332-1.758-1.09-.742.082-.726.082-.726 1.203.086 1.836 1.234 1.836 1.234 1.07 1.836 2.808 1.305 3.492 1 .11-.777.422-1.305.762-1.605-2.664-.301-5.465-1.332-5.465-5.93 0-1.313.469-2.383 1.234-3.223-.121-.3-.535-1.523.117-3.175 0 0 1.008-.32 3.301 1.23A11.487 11.487 0 0116 9.805c1.02.004 2.047.136 3.004.402 2.293-1.55 3.297-1.23 3.297-1.23.656 1.652.246 2.875.12 3.175.77.84 1.231 1.91 1.231 3.223 0 4.61-2.804 5.621-5.476 5.922.43.367.812 1.101.812 2.219 0 1.605-.011 2.898-.011 3.293 0 .32.214.695.824.578C24.566 25.797 28 21.3 28 16c0-6.629-5.371-12-12-12z" />
                                        </svg>
                                    </div>
                                    <span className="sg-ml-4">
                                        {isSignup ? 'Sign Up with GitHub' : 'Log in with GitHub'}
                                    </span>
                                </button>
                            </div>

                            <div className="sg-my-12 sg-border-b sg-text-center">
                                <div
                                    className="sg-leading-none sg-px-2 sg-inline-block sg-text-sm sg-text-gray-600 sg-tracking-wide sg-font-medium sg-bg-white sg-transform sg-translate-y-1/2">
                                    Or {isSignup ? 'sign up' : 'log in'} with e-mail
                                </div>
                            </div>

                            <div className="sg-mx-auto sg-max-w-xs">
                                <input
                                    className="sg-w-full sg-px-8 sg-py-4 sg-rounded-lg sg-font-medium sg-bg-gray-100 sg-border sg-border-gray-200 sg-placeholder-gray-500 sg-text-sm sg-focus:outline-none sg-focus:border-gray-400 sg-focus:bg-white"
                                    type="email" placeholder="Email" />
                                <input
                                    className="sg-w-full sg-px-8 sg-py-4 sg-rounded-lg sg-font-medium sg-bg-gray-100 sg-border sg-border-gray-200 sg-placeholder-gray-500 sg-text-sm sg-focus:outline-none sg-focus:border-gray-400 sg-focus:bg-white sg-mt-5"
                                    type="password" placeholder="Password" />
                                <button
                                    className="sg-mt-5 sg-tracking-wide sg-font-semibold sg-bg-indigo-500 sg-text-gray-100 sg-w-full sg-py-4 sg-rounded-lg sg-hover:bg-indigo-700 sg-transition-all sg-duration-300 sg-ease-in-out sg-flex sg-items-center sg-justify-center sg-focus:shadow-outline sg-focus:outline-none"
                                >
                                    <svg className="sg-w-6 sg-h-6 sg--ml-2" fill="none" stroke="currentColor" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                        <circle cx="8.5" cy="7" r="4" />
                                        <path d="M20 8v6M23 11h-6" />
                                    </svg>
                                    <span className="sg-ml-3">
                                        {isSignup ? 'Sign Up' : 'Log in'}
                                    </span>
                                </button>
                                <p className="sg-mt-6 sg-text-xs sg-text-gray-600 sg-text-center">
                                    I agree to abide by templatana's
                                    <a href="#" className="sg-border-b sg-border-gray-500 sg-border-dotted">
                                        Terms of Service
                                    </a>
                                    and its
                                    <a href="#" className="sg-border-b sg-border-gray-500 sg-border-dotted">
                                        Privacy Policy
                                    </a>
                                </p>
                                <p className="sg-mt-4 sg-text-sm sg-text-center sg-text-gray-600">
                                    <a 
                                        href="#" 
                                        className="sg-text-indigo-500 sg-font-medium"
                                        onClick={() => setIsSignup(!isSignup)}
                                    >
                                        {isSignup ? 'Already have an account?' : "Don't have an account?"}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sg-flex-1 sg-bg-indigo-100 sg-text-center sg-hidden sg-lg:flex">
                    <div className="sg-m-12 sg-xl:m-16 sg-w-full sg-bg-contain sg-bg-center sg-bg-no-repeat"
                        style={{ backgroundImage: "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')" }}>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthComponent;
