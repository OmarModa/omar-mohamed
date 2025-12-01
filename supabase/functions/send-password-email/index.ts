import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  email: string;
  password: string;
  name: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, password, name }: RequestBody = await req.json();

    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // في الإنتاج، هنا نستخدم خدمة بريد إلكتروني مثل Resend أو SendGrid
    // للتجربة، نرجع success
    console.log(`Would send email to: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${name}`);

    // هنا يمكن إضافة كود إرسال البريد الفعلي:
    // const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'نظام سوق الخدمات <noreply@example.com>',
    //     to: email,
    //     subject: 'مرحباً بك في سوق الخدمات',
    //     html: `
    //       <div dir="rtl">
    //         <h2>مرحباً ${name}!</h2>
    //         <p>تم إنشاء حسابك بنجاح في سوق الخدمات.</p>
    //         <p>بيانات الدخول الخاصة بك:</p>
    //         <ul>
    //           <li>البريد الإلكتروني: <strong>${email}</strong></li>
    //           <li>كلمة المرور: <strong>${password}</strong></li>
    //         </ul>
    //         <p>يرجى الاحتفاظ بهذه المعلومات في مكان آمن.</p>
    //       </div>
    //     `
    //   }),
    // });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password email sent successfully (simulated)',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});