import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/index';

export function AuthCallback() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('Processing authentication...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Extract access token from URL hash (Supabase OAuth redirect format)
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const error = hashParams.get('error');
                const errorDescription = hashParams.get('error_description');

                if (error) {
                    console.error('[AUTH_CALLBACK] OAuth error:', error, errorDescription);
                    setStatus(`Authentication failed: ${errorDescription || error}`);
                    setTimeout(() => navigate('/'), 3000);
                    return;
                }

                if (!accessToken) {
                    console.error('[AUTH_CALLBACK] No access token in URL');
                    setStatus('No access token found. Redirecting...');
                    setTimeout(() => navigate('/'), 2000);
                    return;
                }

                console.log('[AUTH_CALLBACK] Access token found, validating with backend...');
                setStatus('Validating session...');

                // Send token to backend for validation and profile provisioning
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/oauth/callback`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token: accessToken })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('[AUTH_CALLBACK] Backend validation failed:', errorData);
                    setStatus(`Validation failed: ${errorData.error || 'Unknown error'}`);
                    setTimeout(() => navigate('/'), 3000);
                    return;
                }

                const data = await response.json();
                console.log('[AUTH_CALLBACK] Session validated, user:', data.user.id);

                // Store session
                localStorage.setItem('blastr_session', JSON.stringify(data.session));
                localStorage.setItem('blastr_user', JSON.stringify(data.user));

                // Notify auth listeners
                authService.notifyAuthListeners(data.session);

                setStatus('Success! Redirecting to dashboard...');
                console.log('[AUTH_CALLBACK] Redirecting to dashboard');

                // Redirect to dashboard
                setTimeout(() => navigate('/dashboard'), 500);
            } catch (error: any) {
                console.error('[AUTH_CALLBACK] Unexpected error:', error);
                setStatus(`Error: ${error.message}`);
                setTimeout(() => navigate('/'), 3000);
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-blue-500 font-mono text-sm uppercase tracking-widest">{status}</p>
            </div>
        </div>
    );
}
