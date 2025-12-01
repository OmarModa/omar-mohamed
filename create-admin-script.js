import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vhymurviqcaszlrjcgce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeW11cnZpcWNhc3pscmpjZ2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzI2MzYsImV4cCI6MjA4MDE0ODYzNn0.tg-ni9oyKO_BWlNdZfPVdZez8ocSWMRnm4Lu7WwX0O4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminAccount() {
    try {
        console.log('Creating admin account...');
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: 'moraflash@gmail.com',
            password: '68880122aA@',
        });

        if (authError) {
            console.error('Auth Error:', authError);
            throw authError;
        }
        
        if (!authData.user) {
            throw new Error('No user returned');
        }

        console.log('User created:', authData.user.id);

        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                name: 'المشرف العام',
                role: 'admin',
                contact_info: 'moraflash@gmail.com',
                region: 'العاصمة',
            });

        if (profileError) {
            console.error('Profile Error:', profileError);
            throw profileError;
        }

        console.log('✅ Admin account created successfully!');
        console.log('Email: moraflash@gmail.com');
        console.log('Password: 68880122aA@');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdminAccount();
