import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  request_id: number;
  provider_name: string;
  bid_price: number;
  request_title: string;
  customer_email: string;
  customer_name: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { 
      request_id, 
      provider_name, 
      bid_price, 
      request_title,
      customer_email,
      customer_name 
    }: RequestBody = await req.json();

    if (!request_id || !provider_name || !bid_price || !request_title || !customer_email || !customer_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`📧 Sending bid notification to: ${customer_email}`);
    console.log(`Request: ${request_title}`);
    console.log(`Provider: ${provider_name}`);
    console.log(`Price: ${bid_price} KD`);

    // في الإنتاج، استخدم خدمة بريد حقيقية مثل Resend:
    // const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'سوق الخدمات <noreply@yourdomain.com>',
    //     to: customer_email,
    //     subject: `عرض سعر جديد على طلبك: ${request_title}`,
    //     html: `
    //       <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    //         <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    //           <h2 style="color: #14b8a6; margin-bottom: 20px;">🎉 عرض سعر جديد على طلبك!</h2>
    //           
    //           <p style="font-size: 16px; color: #333; margin-bottom: 10px;">مرحباً <strong>${customer_name}</strong>،</p>
    //           
    //           <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
    //             تم تقديم عرض سعر جديد على طلبك:
    //           </p>
    //           
    //           <div style="background-color: #f0fdfa; padding: 20px; border-radius: 8px; border-right: 4px solid #14b8a6; margin-bottom: 20px;">
    //             <h3 style="color: #14b8a6; margin: 0 0 15px 0; font-size: 18px;">تفاصيل العرض</h3>
    //             <ul style="list-style: none; padding: 0; margin: 0;">
    //               <li style="padding: 8px 0; border-bottom: 1px solid #ccfbf1; font-size: 14px;">
    //                 <strong style="color: #0f766e;">الطلب:</strong> ${request_title}
    //               </li>
    //               <li style="padding: 8px 0; border-bottom: 1px solid #ccfbf1; font-size: 14px;">
    //                 <strong style="color: #0f766e;">مقدم الخدمة:</strong> ${provider_name}
    //               </li>
    //               <li style="padding: 8px 0; font-size: 14px;">
    //                 <strong style="color: #0f766e;">السعر المقترح:</strong> <span style="color: #14b8a6; font-size: 18px; font-weight: bold;">${bid_price} د.ك</span>
    //               </li>
    //             </ul>
    //           </div>
    //           
    //           <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
    //             يمكنك الآن مراجعة العرض وقبوله من خلال صفحة طلباتك.
    //           </p>
    //           
    //           <div style="text-align: center; margin: 30px 0;">
    //             <a href="https://yourwebsite.com" 
    //                style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
    //               عرض الطلب
    //             </a>
    //           </div>
    //           
    //           <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
    //           
    //           <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
    //             هذا إشعار تلقائي من سوق الخدمات<br />
    //             © 2025 جميع الحقوق محفوظة
    //           </p>
    //         </div>
    //       </div>
    //     `
    //   }),
    // });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Bid notification sent successfully (simulated)",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
