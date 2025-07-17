import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-INVOICE] ${step}${detailsStr}`);
};

const generateInvoiceHTML = (invoiceData: any) => {
  const { 
    invoice_number, 
    user_profile, 
    amount, 
    currency, 
    type, 
    description, 
    vat_amount, 
    total_amount,
    issue_date,
    due_date 
  } = invoiceData;

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فاتورة / Invoice - ${invoice_number}</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5;
            direction: rtl;
        }
        .invoice-container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 40px; 
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
            border-radius: 8px;
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 40px; 
            border-bottom: 2px solid #e0e0e0; 
            padding-bottom: 20px;
        }
        .logo { 
            font-size: 32px; 
            font-weight: bold; 
            color: #2563eb;
            margin-bottom: 5px;
        }
        .company-info { 
            text-align: right; 
            color: #666;
            font-size: 14px;
        }
        .invoice-title { 
            background: linear-gradient(135deg, #2563eb, #1d4ed8); 
            color: white; 
            padding: 15px 25px; 
            border-radius: 8px; 
            text-align: center; 
            margin: 20px 0;
        }
        .invoice-title h1 { 
            margin: 0; 
            font-size: 24px;
        }
        .invoice-details { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 30px; 
            margin: 30px 0;
        }
        .detail-section h3 { 
            color: #2563eb; 
            border-bottom: 1px solid #e0e0e0; 
            padding-bottom: 8px; 
            margin-bottom: 15px;
        }
        .detail-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 8px 0; 
            padding: 5px 0;
        }
        .detail-row.strong { 
            font-weight: bold; 
            border-top: 1px solid #e0e0e0; 
            padding-top: 10px; 
            margin-top: 15px;
        }
        .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 30px 0; 
            border: 1px solid #e0e0e0;
        }
        .items-table th, .items-table td { 
            padding: 12px; 
            text-align: center; 
            border: 1px solid #e0e0e0;
        }
        .items-table th { 
            background: #f8fafc; 
            font-weight: bold; 
            color: #374151;
        }
        .total-section { 
            background: #f8fafc; 
            padding: 25px; 
            border-radius: 8px; 
            margin-top: 30px;
        }
        .total-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 10px 0; 
            font-size: 16px;
        }
        .total-row.final { 
            font-size: 20px; 
            font-weight: bold; 
            color: #2563eb; 
            border-top: 2px solid #2563eb; 
            padding-top: 15px; 
            margin-top: 15px;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e0e0e0; 
            color: #666; 
            font-size: 12px;
        }
        .bilingual { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
        }
        .english { 
            direction: ltr; 
            text-align: left;
        }
        .arabic { 
            direction: rtl; 
            text-align: right;
        }
        .watermark { 
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%) rotate(-45deg); 
            font-size: 80px; 
            color: rgba(37, 99, 235, 0.05); 
            font-weight: bold; 
            z-index: -1;
        }
    </style>
</head>
<body>
    <div class="watermark">MANZILY</div>
    <div class="invoice-container">
        <div class="header">
            <div>
                <div class="logo">منزلي Manzily</div>
                <div class="company-info">
                    منصة العقارات الرائدة في الكويت<br>
                    Leading Real Estate Platform in Kuwait<br>
                    الكويت - Kuwait City<br>
                    +965 2222 3333 | info@manzily.kw
                </div>
            </div>
            <div class="english" style="text-align: left;">
                <div style="font-size: 18px; font-weight: bold; color: #2563eb;">INVOICE</div>
                <div style="color: #666; margin-top: 5px;">#${invoice_number}</div>
            </div>
        </div>

        <div class="invoice-title">
            <h1 class="bilingual">
                <span class="arabic">فاتورة ضريبية</span>
                <span class="english">TAX INVOICE</span>
            </h1>
        </div>

        <div class="invoice-details">
            <div class="detail-section">
                <h3>تفاصيل العميل / Customer Details</h3>
                <div class="detail-row">
                    <span>الاسم / Name:</span>
                    <span>${user_profile?.company_name || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span>البريد الإلكتروني / Email:</span>
                    <span>${user_profile?.email || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span>الهاتف / Phone:</span>
                    <span>${user_profile?.phone || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span>رقم الترخيص / License No:</span>
                    <span>${user_profile?.license_number || 'N/A'}</span>
                </div>
            </div>

            <div class="detail-section">
                <h3>تفاصيل الفاتورة / Invoice Details</h3>
                <div class="detail-row">
                    <span>رقم الفاتورة / Invoice No:</span>
                    <span>${invoice_number}</span>
                </div>
                <div class="detail-row">
                    <span>تاريخ الإصدار / Issue Date:</span>
                    <span>${new Date(issue_date).toLocaleDateString('ar-KW')} | ${new Date(issue_date).toLocaleDateString('en-US')}</span>
                </div>
                <div class="detail-row">
                    <span>تاريخ الاستحقاق / Due Date:</span>
                    <span>${new Date(due_date).toLocaleDateString('ar-KW')} | ${new Date(due_date).toLocaleDateString('en-US')}</span>
                </div>
                <div class="detail-row">
                    <span>نوع الخدمة / Service Type:</span>
                    <span>${type === 'subscription' ? 'اشتراك / Subscription' : type === 'featured_listing' ? 'إعلان مميز / Featured Listing' : 'عمولة / Commission'}</span>
                </div>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>الوصف / Description</th>
                    <th>المبلغ / Amount</th>
                    <th>العملة / Currency</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: right;">${description}</td>
                    <td style="font-weight: bold;">${amount.toFixed(3)}</td>
                    <td>${currency}</td>
                </tr>
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <span>المبلغ الفرعي / Subtotal:</span>
                <span>${amount.toFixed(3)} ${currency}</span>
            </div>
            ${vat_amount ? `
            <div class="total-row">
                <span>ضريبة القيمة المضافة / VAT (5%):</span>
                <span>${vat_amount.toFixed(3)} ${currency}</span>
            </div>
            ` : ''}
            <div class="total-row final">
                <span>الإجمالي / Total Amount:</span>
                <span>${total_amount.toFixed(3)} ${currency}</span>
            </div>
        </div>

        <div class="footer">
            <p><strong>شكراً لتعاملكم معنا / Thank you for your business</strong></p>
            <p>هذه فاتورة مُولدة إلكترونياً ولا تحتاج لتوقيع | This is an electronically generated invoice and does not require a signature</p>
            <p>للاستفسارات: info@manzily.kw | For inquiries: info@manzily.kw</p>
        </div>
    </div>
</body>
</html>`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { 
      transaction_id, 
      type, 
      amount, 
      currency = 'KWD', 
      description,
      include_vat = false 
    } = await req.json();
    
    if (!transaction_id || !type || !amount || !description) {
      throw new Error("Missing required fields: transaction_id, type, amount, description");
    }

    // Get user profile
    const { data: userProfile } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Calculate VAT if applicable
    const vat_rate = include_vat ? 0.05 : 0; // 5% VAT in Kuwait
    const vat_amount = amount * vat_rate;
    const total_amount = amount + vat_amount;

    // Generate invoice number
    const invoice_number = `MZ-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const invoice_data = {
      invoice_number,
      user_profile: {
        ...userProfile,
        email: user.email
      },
      amount,
      currency,
      type,
      description,
      vat_amount: include_vat ? vat_amount : null,
      total_amount,
      issue_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    // Generate HTML invoice
    const html_content = generateInvoiceHTML(invoice_data);

    // Store invoice in database
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from("invoices")
      .insert({
        invoice_number,
        user_id: user.id,
        transaction_id,
        type,
        amount: total_amount,
        currency,
        vat_amount: include_vat ? vat_amount : null,
        status: 'generated',
        html_content
      })
      .select()
      .single();

    if (invoiceError) {
      logStep("Database error", { error: invoiceError.message });
      throw new Error(`Database error: ${invoiceError.message}`);
    }

    logStep("Invoice generated successfully", { invoiceId: invoice.id, invoiceNumber: invoice_number });

    return new Response(JSON.stringify({
      success: true,
      invoice: {
        id: invoice.id,
        invoice_number,
        html_content,
        download_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/download-invoice?invoice_id=${invoice.id}`
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in generate-invoice", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});