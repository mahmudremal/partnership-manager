import React, { createContext, useState, useContext, useEffect, use } from 'react';
import { home_route, home_url, rest_url, app_url } from '@functions';
import { Eye, EyeOff, HardHat, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link } from '@common/link';
import { useSettings } from '@context/SettingsProvider';
import { useTranslation } from "@context/LanguageProvider";
import { sprintf } from 'sprintf-js';
import axios from 'axios';
import request from '@common/request';
import logo from '@img/logo.png';
import authImage from '@img/auth-img.png';
import resetImage from '@img/forgot-pass-img.png';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@context/SessionProvider';
import { useLoading } from '@context/LoadingProvider';
import { usePopup } from '@context/PopupProvider';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { __ } = useTranslation();
    const { settings } = useSettings();
    const { session, setSession } = useSession();
    const { loading, setLoading } = useLoading();
    const { setPopup } = usePopup();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        isSignUp: settings?.isSignUp
    });
    const [roles, setRoles] = useState([]);
    const [email, setEmail] = useState('');
    const [isReset, setIsReset] = useState(null);
    const [showPass, setShowPass] = useState(false);
    const [auth, setAuth] = useState(!(
        // settings?.loggedin && 
        session?.authToken
    ));
    // const [auth, setAuth] = useState(settings?.loggedin === true);
    const [error, setError] = useState(null);

    const login = async (args) => {
        try {
            const { data } = await axios.post(rest_url('partnership/v1/token'), args);
            setAuth(false);
            setSession(prev => ({
                ...prev,
                authToken: data.token,
                user_id: data.bearer,
                user: data?.user
            }));
            navigate(home_route('/'));
            return data.token;
        } catch (err) {
            setAuth(true);
            throw err;
        }
    };

    const submit_auth_function = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login({
                ...form,
                username: form?.isSignUp ? '' : form?.username,
                // email, password, isSignUp,
                // firstName, lastName, password2
            });
        } catch (err) {
            console.error('Login failed', err);
            if (err?.response && err?.response?.data && err?.response?.data?.message) {
                setError([`${err?.response?.data?.message??''}`, `${err?.response?.data?.error??''}`].join(' '));
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setAuth(true);
        setSession(prev => ({ ...prev, authToken: null, user_id: null, user: null }));
    }

    request.setAuth = setAuth;


    // const authenticatedRequest = async (url, options = {}) => {
    //     try {
    //         const headers = {
    //             ...options.headers,
    //             Authorization: `Bearer ${token}`
    //         };
    //         return await axios({ url, ...options, headers });
    //     } catch (err) {
    //         if (err.response?.status === 403 && username && password) {
    //             try {
    //                 const newToken = await login(username, password);
    //                 return await axios({ url, ...options, headers: { ...options.headers, Authorization: `Bearer ${newToken}` } });
    //             } catch (reAuthErr) {
    //                 setAuth(false);
    //                 throw reAuthErr;
    //             }
    //         }
    //         throw err;
    //     }
    // };

    useEffect(() => {
        if (auth) {
            navigate(form?.isSignUp ? '/signup' : '/signin');
        }
    }, [form?.isSignUp, navigate]);

    useEffect(() => {
        if (!auth) {return;}
        if (!form?.isSignUp) {return;}
        if (roles?.length) {return;}
        request(rest_url('/partnership/v1/roles'))
        .then(res => {
            console.log(res);
            setRoles(
                Object.keys(res).filter(k => !['partnership_project_manager'].includes(k)).reduce((acc, roleKey) => {
                    acc[roleKey] = res[roleKey].label;
                    return acc;
                }, {})
            );
        })
        .catch(err => console.error(err))
        .finally(() => {});
    }, [form?.isSignUp, auth])

    return (
        <AuthContext.Provider value={{ auth, setAuth, logout }}>
            {auth ? (
                <section className="auth bg-base d-flex flex-wrap xpo_h-screen xpo_overflow-hidden xpo_overflow-y-auto">  
                    <div className="auth-left d-lg-block d-none">
                        <div className="d-flex align-items-center flex-column h-100 justify-content-center xpo_relative">
                            <img src={isReset ? resetImage : authImage} alt={__('Authentication screen banner')} />
                            <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_w-full xpo_h-full"></div>
                        </div>
                    </div>
                    <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center">
                        <div className={ `${form?.isSignUp ? 'max-w-464-px' : 'xpo_max-w-xl'} mx-auto w-100` }>
                            <div>
                                <Link to={ home_url('/') } className="mb-40 max-w-290-px">
                                    <img src={logo} alt={__('Logo')} />
                                </Link>
                                <h4 className="mb-12">{isReset ? __('Reset Password') : (form?.isSignUp ? __('Sign Up to your Account') : __('Sign In to your Account'))}</h4>
                                <p className="mb-32 text-secondary-light text-lg">{isReset ? __('Enter the email address associated with your account and we will send you a link to reset your password.') : (form?.isSignUp ? __('Welcome! please enter your detail') : __('Welcome back! please enter your detail'))}</p>
                                {error && (
                                    <div className="mb-16">
                                        <div className="alert alert-danger bg-transparent text-danger-600 border-danger-600 px-24 py-11 mb-0 fw-semibold text-lg radius-8 d-flex align-items-center justify-content-between" role="alert">
                                            <span dangerouslySetInnerHTML={{__html: error}}></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <form onSubmit={submit_auth_function}>
                                {isReset ? (
                                    <>
                                        <div className="icon-field">
                                            <span className="icon top-50 translate-middle-y">
                                                <Mail />
                                            </span>
                                            <input
                                                type="email"
                                                value={form?.email}
                                                placeholder={__('Enter Email')}
                                                onChange={(e) => setForm(prev => ({...prev, email: e.target.value}))}
                                                className="form-control h-56-px bg-neutral-50 radius-12"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setLoading(true);
                                                const formData = new FormData();
                                                formData.append('email', form?.email);
                                                request(rest_url('/partnership/v1/reset-password'), {
                                                    method: 'POST', headers: {'Cache-Control': 'no-cache'}, body: formData
                                                })
                                                .then(res => {
                                                    setPopup(
                                                        <div className="xpo_text-center xpo_flex xpo_flex-col xpo_items-center xpo_gap-5">
                                                            <div className="xpo_text-center xpo_flex xpo_flex-col xpo_items-center xpo_gap-3">
                                                                <div className="xpo_flex xpo_justify-center">
                                                                    <img className="xpo_w-36" src={app_url('/icons/mail-open.svg')} alt="" />
                                                                </div>
                                                                <h6>{__('Verify your Email')}</h6>
                                                                <p className="text-secondary-light text-sm mb-0">{__('Thank you, check your email for instructions to reset your password')}</p>
                                                            </div>
                                                            <button type="button" className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12" onClick={() => {setPopup(null);setIsReset(false);}}>{__('Skip')}</button>
                                                            <div className="text-sm">
                                                                <p className="mb-0">{__('Don’t receive an email?')} <button type="button" className="text-primary-600 fw-semibold" onClick={(e) => {
                                                                    e.target.disabled = true;
                                                                    e.target.innerText = __('Sending...');
                                                                    request(rest_url('/partnership/v1/reset-password'), {method: 'POST', 'Cache-Control': 'no-cache', body: formData}).finally(() => {
                                                                        let count = 30;const loop = setInterval(() => {e.target.innerText = sprintf(__('Wait for %d seconds'), count);count--;}, 1000);
                                                                        setTimeout(() => {clearInterval(loop);e.target.disabled = false;e.target.innerText = __('Resend');}, 30000);
                                                                    });
                                                                }}>{__('Resend')}</button></p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                                .catch((err) => setPopup(
                                                    <div className="xpo_text-center xpo_flex xpo_flex-col xpo_items-center xpo_gap-5 xpo_text-primary-400">
                                                        {err?.response?.message??err?.message??__('Something went wrong')}
                                                    </div>
                                                ))
                                                .finally(() => {
                                                    setLoading(false);
                                                });
                                            }}
                                            className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
                                        >{__('Continue')}</button>
                                        <div className="text-center ">
                                            <button className="text-primary-600 fw-bold mt-24" onClick={(e) => setIsReset(null)}>{__('Back to Sign In')}</button>
                                        </div>
                                        <div className="mt-120 text-center text-sm">
                                            <p className="mb-0">{__('Already have an account?')} <button className="text-primary-600 fw-semibold" onClick={(e) => setIsReset(null)}>{__('Sign In')}</button></p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {form?.isSignUp && (
                                            <div className="icon-field mb-16">
                                                <span className="icon top-50 translate-middle-y">
                                                    <HardHat />
                                                </span>
                                                <select
                                                    type="text"
                                                    value={form?.role}
                                                    placeholder={__('Role')}
                                                    className="form-control bg-neutral-50 radius-12"
                                                    onChange={(e) => setForm(prev => ({...prev, role: e.target.value}))}
                                                >
                                                    {Object.keys(roles).map((roleKey, i) => <option key={i} value={roleKey}>{roles[roleKey]}</option>)}
                                                    
                                                </select>
                                            </div>
                                        )}
                                        {!form?.isSignUp && (
                                            <div className="icon-field mb-16">
                                                <span className="icon top-50 translate-middle-y">
                                                    <UserRound />
                                                </span>
                                                <input
                                                    type="text"
                                                    value={form?.username}
                                                    placeholder={__('Username')}
                                                    className="form-control h-56-px bg-neutral-50 radius-12"
                                                    onChange={(e) => setForm(prev => ({...prev, username: e.target.value}))}
                                                />
                                            </div>
                                        )}
                                        {form?.isSignUp && (
                                            <div className="icon-field mb-16">
                                                <span className="icon top-50 translate-middle-y">
                                                    <Mail />
                                                </span>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={form?.email}
                                                    placeholder={__('Email')}
                                                    onChange={(e) => setForm(prev => ({...prev, email: e.target.value}))}
                                                    className="form-control h-56-px bg-neutral-50 radius-12"
                                                />
                                            </div>
                                        )}
                                        {form?.isSignUp && (
                                            <div className="xpo_flex xpo_gap-2 mb-16">
                                                <div className="col">
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        value={form?.firstName}
                                                        placeholder={__('First Name')}
                                                        onChange={(e) => setForm(prev => ({...prev, firstName: e.target.value}))}
                                                        className="form-control h-56-px bg-neutral-50 radius-12"
                                                    />
                                                </div>
                                                <div className="col">
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        value={form?.lastName}
                                                        placeholder={__('Last Name')}
                                                        onChange={(e) => setForm(prev => ({...prev, lastName: e.target.value}))}
                                                        className="form-control h-56-px bg-neutral-50 radius-12"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div className="position-relative mb-20">
                                            <div className="icon-field">
                                                <span className="icon top-50 translate-middle-y">
                                                    <LockKeyhole />
                                                </span> 
                                                <input
                                                    name="password"
                                                    value={form?.password}
                                                    id="your-password"
                                                    placeholder={__('Password')}
                                                    type={showPass ? 'text' : 'password'}
                                                    onChange={(e) => setForm(prev => ({...prev, password: e.target.value}))}
                                                    className="form-control h-56-px bg-neutral-50 radius-12"
                                                />
                                            </div>
                                            <span className="toggle-password cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light" data-toggle="#your-password" onClick={() => setShowPass(prev => !prev)}>
                                                {showPass ? <EyeOff /> : <Eye />}
                                            </span>
                                            {form?.isSignUp && <span className="mt-12 text-sm text-secondary-light">{__('Your password must have at least 8 characters')}</span>}
                                        </div>
                                        {form?.isSignUp && (
                                            <div className="position-relative mb-20">
                                                <div className="icon-field">
                                                    <span className="icon top-50 translate-middle-y">
                                                        <LockKeyhole />
                                                    </span> 
                                                    <input
                                                        value={form?.password2}
                                                        placeholder={__('Confirm Password')}
                                                        type={showPass ? 'text' : 'password'}
                                                        onChange={(e) => setForm(prev => ({...prev, password2: e.target.value}))}
                                                        className="form-control h-56-px bg-neutral-50 radius-12"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {form?.isSignUp ? (
                                            <div className="">
                                                <div className="d-flex justify-content-between gap-2">
                                                    <div className="form-check style-check d-flex align-items-start">
                                                        <input className="form-check-input border border-neutral-300 mt-4" type="checkbox" value="" id="condition" />
                                                        <label className="form-check-label text-sm" htmlFor="condition" dangerouslySetInnerHTML={{__html: sprintf(
                                                            __('By creating an account means you agree to the %1$sTerms & Conditions%3$s and our %2$sPrivacy Policy%3$s.'),
                                                            '<a href="'+ (settings?.pages?.terms??"#") +'" className="xpo_text-primary fw-semibold" target="_blank" style="color: #E03C33;">',
                                                            '<a href="'+ (settings?.pages?.privacy??"#") +'" className="xpo_text-primary fw-semibold" target="_blank" style="color: #E03C33;">',
                                                            '</a>'
                                                        )}}>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="">
                                                <div className="d-flex justify-content-between gap-2">
                                                    <div className="form-check style-check d-flex align-items-center">
                                                        <input className="form-check-input border border-neutral-300" type="checkbox" value="" id="remeber" />
                                                        <label className="form-check-label" htmlFor="remeber">{__('Remember me')} </label>
                                                    </div>
                                                    <span onClick={(e) => setIsReset(true)} className="text-primary-600 fw-medium xpo_cursor-pointer">{__('Forgot Password?')}</span>
                                                </div>
                                            </div>
                                        )}

                                        <button type="submit" className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32">{form?.isSignUp ? __('Sign Up') : __('Sign In')}</button>

                                        {/* <div className="mt-32 center-border-horizontal text-center">
                                            <span className="bg-base z-1 px-4">{__('Or sign in with')}</span>
                                        </div>
                                        <div className="mt-32 d-flex align-items-center gap-3">
                                            <button type="button" className="fw-semibold text-primary-light py-16 px-24 w-50 border radius-12 text-md d-flex align-items-center justify-content-center gap-12 line-height-1 bg-hover-primary-50"> 
                                                <svg className="xpo_h-6 xpo_w-6 text-primary-600 text-xl line-height-1" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" fill='#487FFF' /></svg>
                                                {__('Facebook')}
                                            </button>
                                            <button type="button" className="fw-semibold text-primary-light py-16 px-24 w-50 border radius-12 text-md d-flex align-items-center justify-content-center gap-12 line-height-1 bg-hover-primary-50"> 
                                                <svg className="xpo_h-6 xpo_w-6 text-primary-600 text-xl line-height-1" viewBox="-0.5 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><title>Google-color</title><desc>Created with Sketch.</desc><defs></defs><g id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"><g id="Color-" transform="translate(-401.000000, -860.000000)"><g id="Google" transform="translate(401.000000, 860.000000)"><path d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24" id="Fill-1" fill="#FBBC05"></path><path d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333" id="Fill-2" fill="#EB4335"></path><path d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667" id="Fill-3" fill="#34A853"></path><path d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24" id="Fill-4" fill="#4285F4"></path></g></g></g></g></svg>
                                                {__('Google')}
                                            </button>
                                        </div> */}
                                        <div className="mt-32 text-center text-sm">
                                            {form?.isSignUp ? (
                                                <p className="mb-0">{__("Already have an account")} <Link to="#" className="text-primary-600 fw-semibold" onClick={() => setForm(prev => ({...prev, isSignUp: false}))}>{__('Sign In')}</Link></p>
                                            ) : (
                                                <p className="mb-0">{__("Don't have an account?")} <Link to="#" className="text-primary-600 fw-semibold" onClick={() => setForm(prev => ({...prev, isSignUp: true}))}>{__('Sign Up')}</Link></p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>
                </section>
            ) : (
                <div>
                    {children}
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
