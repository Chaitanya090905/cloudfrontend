import emailjs from '@emailjs/browser';

// EmailJS Configuration
// In a real app, these should be in .env.local
// For now, we use the ones the user provided
const EMAILJS_SERVICE_ID = 'service_r9uzavq';
const EMAILJS_TEMPLATE_ID = 'template_70n1ds7';
const EMAILJS_PUBLIC_KEY = 'JVqvMdzdAMU561yx7';

emailjs.init(EMAILJS_PUBLIC_KEY);

interface WelcomeEmailParams {
    to_email: string;
    to_name: string;
    org_name: string;
    password: string;
}

export const sendWelcomeEmail = async (params: WelcomeEmailParams): Promise<boolean> => {
    try {
        const templateParams = {
            to_email: params.to_email,
            to_name: params.to_name,
            org_name: params.org_name,
            password: params.password,
        };

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams,
            EMAILJS_PUBLIC_KEY
        );

        console.log('Welcome email sent successfully!', response.status, response.text);
        return true;
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        return false;
    }
};
