import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PaymentsService as ApiPaymentsService } from '../api/api/payments.service';
import {
  CreatePaymentOrderDto,
  VerifyPaymentDto,
  CheckEnrollmentDto,
  UpdateEnrollmentStatusDto,
} from '../api/model/models';
import { AuthService, User } from './auth.service';
import { environment } from '../../environments/environment';
import { toast } from 'ngx-sonner';

export interface CheckoutCourseParams {
  courseId: number;
  courseTitle: string;
  amount: number; // in INR or standard currency units
  receipt?: string;
  notes?: Record<string, any>;
}

export interface PaymentTransactionItem {
  id: number;
  orderNumber?: string;
  gatewayOrderId?: string;
  paymentId?: string;
  userId: number;
  studentName?: string;
  studentEmail?: string;
  courseId: number;
  courseName?: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  createdAt: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private razorpayScriptLoaded = false;
  private readonly baseUrl = environment.api_url;

  constructor(
    private apiPaymentsService: ApiPaymentsService,
    private httpClient: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Dynamically loads the Razorpay checkout script if not already present
   */
  public loadRazorpaySdk(): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      this.razorpayScriptLoaded = true;
      return Promise.resolve(true);
    }

    if (this.razorpayScriptLoaded) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        this.razorpayScriptLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        console.error('[PaymentService] Failed to load Razorpay Checkout SDK');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Fetch public Razorpay Key ID from backend
   */
  public getPublicKey(): Observable<string> {
    const basePath = this.baseUrl;
    return this.httpClient.get<any>(`${basePath}/payments/key`).pipe(
      map((res: any) => {
        if (typeof res === 'string') return res;
        return res?.key || res?.data?.key || res?.publicKey || '';
      }),
      catchError((err) => {
        console.warn('[PaymentService] Could not fetch Razorpay key from backend:', err);
        return of('');
      })
    );
  }

  /**
   * Create payment order on backend
   */
  public createPaymentOrder(dto: CreatePaymentOrderDto): Observable<any> {
    const basePath = this.baseUrl;
    return this.httpClient.post<any>(`${basePath}/payments/create-order`, dto).pipe(
      catchError((err) => {
        return throwError(() => err?.error || err);
      })
    );
  }

  /**
   * Verify Razorpay payment signature on backend
   */
  public verifyPayment(dto: VerifyPaymentDto): Observable<any> {
    const basePath = this.baseUrl;
    return this.httpClient.post<any>(`${basePath}/payments/verify`, dto).pipe(
      catchError((err) => {
        return throwError(() => err?.error || err);
      })
    );
  }

  /**
   * Get payment orders by user ID
   */
  public getUserOrders(userId: number | string): Observable<any[]> {
    const basePath = this.baseUrl;
    return this.httpClient.post<any>(`${basePath}/payments/orders/user/${userId}`, {}).pipe(
      map((res) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.[0])) return res[0];
        return [];
      }),
      catchError((err) => {
        console.error('[PaymentService] Error fetching user orders:', err);
        return of([]);
      })
    );
  }

  /**
   * Get all course enrollments (for Admin payments page)
   */
  public getAllEnrollments(): Observable<any[]> {
    const basePath = this.baseUrl;
    return this.httpClient.post<any>(`${basePath}/payments/enrollments/getall`, {}).pipe(
      map((res) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.[0])) return res[0];
        return [];
      }),
      catchError((err) => {
        console.error('[PaymentService] Error fetching all enrollments:', err);
        return of([]);
      })
    );
  }

  /**
   * Get course enrollments for a specific student
   */
  public getUserEnrollments(userId: number | string): Observable<any[]> {
    const basePath = this.baseUrl;
    return this.httpClient.post<any>(`${basePath}/payments/enrollments/user/${userId}`, {}).pipe(
      map((res) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.[0])) return res[0];
        return [];
      }),
      catchError((err) => {
        console.error('[PaymentService] Error fetching user enrollments:', err);
        return of([]);
      })
    );
  }

  /**
   * Check if user is enrolled and has access to a course
   */
  public checkEnrollment(userId: number | string, courseId: number | string): Observable<boolean> {
    const basePath = this.baseUrl;
    return this.httpClient.post<any>(`${basePath}/payments/enrollments/check`, {
      users_id: Number(userId),
      course_id: Number(courseId),
    }).pipe(
      map((res) => {
        const item = res?.data || (Array.isArray(res) ? res[0] : res);
        return Boolean(item?.has_access === 1 || item?.has_access === true || item?.payment_status === 'paid');
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Full end-to-end Razorpay Checkout Workflow
   */
  public async checkoutCourse(params: CheckoutCourseParams): Promise<{ success: boolean; data?: any; error?: string }> {
    const user = this.authService.currentUserValue;
    if (!user || !user.id) {
      toast.error('Authentication Required', {
        description: 'Please log in to your student account to enroll and purchase courses.',
      });
      return { success: false, error: 'User is not logged in.' };
    }

    // Extract numeric user ID
    const numericUserId = parseInt(String(user.id).replace(/\D/g, ''), 10) || 1;

    // Load Razorpay script
    const sdkLoaded = await this.loadRazorpaySdk();
    if (!sdkLoaded) {
      toast.error('Payment Gateway Error', {
        description: 'Unable to initialize Razorpay checkout script. Please check your internet connection.',
      });
      return { success: false, error: 'Razorpay SDK failed to load.' };
    }

    return new Promise((resolve) => {
      toast.loading('Initiating Payment Order...', { id: 'rzp-order' });

      // 1. Create order on backend
      this.createPaymentOrder({
        users_id: numericUserId,
        course_id: Number(params.courseId),
        amount: Number(params.amount),
        currency: 'INR',
        receipt: params.receipt || `rcpt_${Date.now()}_${params.courseId}`,
        notes: {
          course_title: params.courseTitle,
          student_name: user.name,
          student_email: user.email,
          ...(params.notes || {}),
        },
      }).subscribe({
        next: (orderRes: any) => {
          toast.dismiss('rzp-order');

          if (orderRes?.alreadyEnrolled) {
            toast.info('Already Enrolled', {
              description: orderRes?.msg || 'You already have active paid access to this course!',
            });
            resolve({ success: true, data: orderRes });
            return;
          }

          if (!orderRes || orderRes.ok === false) {
            const errDetail = orderRes?.msg || orderRes?.error || 'Failed to create payment order.';
            toast.error('Order Creation Failed', { description: errDetail });
            resolve({ success: false, error: errDetail });
            return;
          }

          const backendOrder = orderRes.razorpay_order || orderRes.order || orderRes.data || orderRes;
          const razorpayKey = orderRes.key_id || orderRes.key || '';
          const orderId = backendOrder.id || orderRes.gateway_order_id || backendOrder.gateway_order_id;
          const amountInPaise = backendOrder.amount || Math.round(Number(params.amount) * 100);

          // 2. Open Razorpay Checkout modal
          const options = {
            key: razorpayKey,
            amount: amountInPaise,
            currency: backendOrder.currency || 'INR',
            name: 'LearnSphere LMS',
            description: `Enrollment: ${params.courseTitle}`,
            image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
            order_id: orderId,
            prefill: {
              name: user.name || '',
              email: user.email || '',
              contact: user.phone || '9999999999',
            },
            notes: {
              course_id: String(params.courseId),
              course_title: params.courseTitle,
              users_id: String(numericUserId),
            },
            theme: {
              color: '#2563eb',
            },
            handler: (response: any) => {
              // 3. Verify payment signature on backend
              toast.loading('Verifying Payment Signature...', { id: 'rzp-verify' });

              const verifyDto: VerifyPaymentDto = {
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                users_id: numericUserId,
                course_id: Number(params.courseId),
                payment_method: 'razorpay',
              };

              this.verifyPayment(verifyDto).subscribe({
                next: (verifyRes: any) => {
                  toast.dismiss('rzp-verify');
                  if (verifyRes?.ok !== false) {
                    toast.success('Payment & Enrollment Confirmed! 🎉', {
                      description: `You are now enrolled in "${params.courseTitle}". Happy learning!`,
                    });
                    resolve({ success: true, data: verifyRes });
                  } else {
                    toast.error('Payment Verification Warning', {
                      description: verifyRes?.msg || 'Could not verify signature with server.',
                    });
                    resolve({ success: false, error: verifyRes?.msg });
                  }
                },
                error: (verifyErr: any) => {
                  toast.dismiss('rzp-verify');
                  const msg = verifyErr?.msg || verifyErr?.message || 'Payment verification failed.';
                  toast.error('Verification Error', { description: msg });
                  resolve({ success: false, error: msg });
                },
              });
            },
            modal: {
              ondismiss: () => {
                toast.dismiss('rzp-order');
                toast.info('Checkout Cancelled', {
                  description: 'Payment was not completed. You can retry enrollment anytime.',
                });
                resolve({ success: false, error: 'Checkout window closed by user.' });
              },
            },
          };

          const isSimulated =
            !razorpayKey ||
            razorpayKey === 'rzp_test_placeholder' ||
            (typeof orderId === 'string' && orderId.startsWith('sim_')) ||
            backendOrder?.notes?.simulated === true;

          if (isSimulated) {
            this.openSimulatedCheckoutModal(options, params);
            return;
          }

          try {
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', (failResp: any) => {
              toast.error('Payment Failed', {
                description: failResp?.error?.description || 'Transaction declined by payment provider.',
              });
              resolve({ success: false, error: failResp?.error?.description });
            });
            rzp.open();
          } catch (rzpErr: any) {
            console.error('[PaymentService] Error launching Razorpay modal, falling back to simulated checkout:', rzpErr);
            this.openSimulatedCheckoutModal(options, params);
          }
        },
        error: (err: any) => {
          toast.dismiss('rzp-order');
          const errorMsg = err?.msg || err?.message || 'Failed to communicate with payment server.';
          toast.error('Payment Setup Error', { description: errorMsg });
          resolve({ success: false, error: errorMsg });
        },
      });
    });
  }

  /**
   * Renders a fully functional, realistic Razorpay-styled payment modal for test/sandbox mode
   * so checkout never gets stuck on the loading shield when test/mock orders are used.
   */
  private openSimulatedCheckoutModal(options: any, params: CheckoutCourseParams): void {
    const existingModal = document.getElementById('rzp-simulated-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const amountInRupees = (options.amount / 100).toFixed(2);
    const modalWrapper = document.createElement('div');
    modalWrapper.id = 'rzp-simulated-modal';
    modalWrapper.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: rzpFadeIn 0.2s ease-out forwards;
    `;

    modalWrapper.innerHTML = `
      <style>
        @keyframes rzpFadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        .rzp-tab-btn { transition: all 0.15s ease; border-left: 3px solid transparent; }
        .rzp-tab-btn.active { background: #eff6ff; color: #1d4ed8; font-weight: 600; border-left-color: #2563eb; }
        .rzp-btn-hover:hover { opacity: 0.95; transform: translateY(-1px); }
        .rzp-radio-card:hover { border-color: #3b82f6; background-color: #f8fafc; }
      </style>
      <div style="
        width: 100%;
        max-width: 680px;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      ">
        <!-- Razorpay Header -->
        <div style="background: #0c2340; color: #ffffff; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 42px; height: 42px; background: #2563eb; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; color: #fff; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.4);">
              ⚡
            </div>
            <div>
              <div style="font-size: 16px; font-weight: 700; letter-spacing: -0.02em;">LearnSphere LMS Checkout</div>
              <div style="font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                <span style="display: inline-block; width: 6px; height: 6px; background: #22c55e; border-radius: 50%;"></span>
                Razorpay Test Gateway • 256-bit SSL Encrypted
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600; letter-spacing: 0.05em;">Amount Payable</div>
            <div style="font-size: 22px; font-weight: 800; color: #38bdf8;">₹${amountInRupees}</div>
          </div>
        </div>

        <!-- Course Info Bar -->
        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; font-size: 13px;">
          <div style="color: #334155; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 420px;">
            📚 ${params.courseTitle}
          </div>
          <div style="color: #64748b; font-size: 12px;">
            Order: <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${options.order_id}</code>
          </div>
        </div>

        <!-- Checkout Body with Sidebar Tabs -->
        <div style="display: flex; min-height: 330px;">
          <!-- Tabs Navigation -->
          <div style="width: 200px; border-right: 1px solid #e2e8f0; background: #fafafa; padding: 12px 0;">
            <div id="tab-upi" class="rzp-tab-btn active" style="padding: 12px 18px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px;">
              <span style="font-size: 18px;">📱</span> UPI / QR Code
            </div>
            <div id="tab-card" class="rzp-tab-btn" style="padding: 12px 18px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; color: #475569;">
              <span style="font-size: 18px;">💳</span> Cards (Credit/Debit)
            </div>
            <div id="tab-net" class="rzp-tab-btn" style="padding: 12px 18px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; color: #475569;">
              <span style="font-size: 18px;">🏛️</span> Net Banking
            </div>
            <div id="tab-wallet" class="rzp-tab-btn" style="padding: 12px 18px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; color: #475569;">
              <span style="font-size: 18px;">👛</span> Wallets
            </div>

            <!-- Demo Badge inside sidebar -->
            <div style="margin: 36px 14px 10px 14px; padding: 10px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; font-size: 11px; color: #92400e; line-height: 1.4;">
              <strong>ℹ️ Sandbox Mode</strong><br>
              Simulated payment gateway. Click "Pay" to test instant enrollment activation.
            </div>
          </div>

          <!-- Tab Content Area -->
          <div style="flex: 1; padding: 22px 26px; overflow-y: auto;">
            <!-- UPI Tab Panel -->
            <div id="panel-upi">
              <div style="font-weight: 700; color: #0f172a; font-size: 15px; margin-bottom: 12px;">Instant UPI & QR Payment</div>
              <div style="border: 1px dashed #cbd5e1; border-radius: 12px; padding: 16px; text-align: center; background: #fcfcfd; margin-bottom: 16px;">
                <div style="display: inline-block; background: #ffffff; padding: 10px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                  <!-- Styled simulated SVG QR code -->
                  <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="110" height="110" fill="white"/>
                    <rect x="10" y="10" width="30" height="30" stroke="#0f172a" stroke-width="4" fill="none"/>
                    <rect x="18" y="18" width="14" height="14" fill="#2563eb"/>
                    <rect x="70" y="10" width="30" height="30" stroke="#0f172a" stroke-width="4" fill="none"/>
                    <rect x="78" y="18" width="14" height="14" fill="#2563eb"/>
                    <rect x="10" y="70" width="30" height="30" stroke="#0f172a" stroke-width="4" fill="none"/>
                    <rect x="18" y="78" width="14" height="14" fill="#2563eb"/>
                    <rect x="48" y="12" width="14" height="14" fill="#0f172a"/>
                    <rect x="48" y="48" width="14" height="14" fill="#2563eb"/>
                    <rect x="12" y="48" width="14" height="14" fill="#0f172a"/>
                    <rect x="72" y="48" width="26" height="14" fill="#0f172a"/>
                    <rect x="48" y="72" width="14" height="26" fill="#0f172a"/>
                    <rect x="72" y="72" width="14" height="14" fill="#0f172a"/>
                    <rect x="88" y="88" width="12" height="12" fill="#2563eb"/>
                  </svg>
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 8px; font-weight: 500;">
                  Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
                </div>
              </div>

              <div style="display: flex; gap: 8px; margin-bottom: 14px;">
                <div class="rzp-radio-card" style="flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; text-align: center; font-size: 12px; font-weight: 600; cursor: pointer; color: #334155;">
                  Google Pay
                </div>
                <div class="rzp-radio-card" style="flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; text-align: center; font-size: 12px; font-weight: 600; cursor: pointer; color: #334155;">
                  PhonePe
                </div>
                <div class="rzp-radio-card" style="flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; text-align: center; font-size: 12px; font-weight: 600; cursor: pointer; color: #334155;">
                  Paytm
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 12px; color: #475569; font-weight: 600; margin-bottom: 4px;">Or enter UPI ID / VPA</label>
                <input id="rzp-upi-input" type="text" value="${options.prefill?.contact || 'student'}@okhdfcbank" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; outline: none;" placeholder="e.g. mobile@upi" />
              </div>
            </div>

            <!-- Card Tab Panel -->
            <div id="panel-card" style="display: none;">
              <div style="font-weight: 700; color: #0f172a; font-size: 15px; margin-bottom: 12px;">Credit / Debit Card</div>
              <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 12px; color: #475569; font-weight: 600; margin-bottom: 4px;">Card Number</label>
                <input type="text" value="4532 8920 1142 8899" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; font-family: monospace;" />
              </div>
              <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                <div style="flex: 1;">
                  <label style="display: block; font-size: 12px; color: #475569; font-weight: 600; margin-bottom: 4px;">Expiry Date</label>
                  <input type="text" value="12/28" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px;" />
                </div>
                <div style="width: 90px;">
                  <label style="display: block; font-size: 12px; color: #475569; font-weight: 600; margin-bottom: 4px;">CVV</label>
                  <input type="password" value="888" maxlength="4" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px;" />
                </div>
              </div>
              <div>
                <label style="display: block; font-size: 12px; color: #475569; font-weight: 600; margin-bottom: 4px;">Name on Card</label>
                <input type="text" value="${options.prefill?.name || 'LearnSphere Student'}" style="width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px;" />
              </div>
            </div>

            <!-- Net Banking Panel -->
            <div id="panel-net" style="display: none;">
              <div style="font-weight: 700; color: #0f172a; font-size: 15px; margin-bottom: 12px;">Popular Indian Banks</div>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                <div class="rzp-radio-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; cursor: pointer; font-size: 13px; font-weight: 600; color: #1e293b;">
                  🏦 HDFC Bank
                </div>
                <div class="rzp-radio-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; cursor: pointer; font-size: 13px; font-weight: 600; color: #1e293b;">
                  🏦 State Bank of India
                </div>
                <div class="rzp-radio-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; cursor: pointer; font-size: 13px; font-weight: 600; color: #1e293b;">
                  🏦 ICICI Bank
                </div>
                <div class="rzp-radio-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; cursor: pointer; font-size: 13px; font-weight: 600; color: #1e293b;">
                  🏦 Axis Bank
                </div>
              </div>
            </div>

            <!-- Wallets Panel -->
            <div id="panel-wallet" style="display: none;">
              <div style="font-weight: 700; color: #0f172a; font-size: 15px; margin-bottom: 12px;">Supported Wallets</div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div class="rzp-radio-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 13px; font-weight: 600; color: #1e293b;">
                  <span>Paytm Wallet</span>
                  <span style="color: #10b981; font-size: 11px;">Available</span>
                </div>
                <div class="rzp-radio-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 13px; font-weight: 600; color: #1e293b;">
                  <span>Mobikwik</span>
                  <span style="color: #10b981; font-size: 11px;">Available</span>
                </div>
                <div class="rzp-radio-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 13px; font-weight: 600; color: #1e293b;">
                  <span>Amazon Pay</span>
                  <span style="color: #10b981; font-size: 11px;">Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div style="background: #ffffff; border-top: 1px solid #e2e8f0; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between;">
          <button id="rzp-cancel-btn" style="background: none; border: 1px solid #cbd5e1; color: #64748b; font-weight: 600; padding: 9px 18px; border-radius: 8px; cursor: pointer; font-size: 13px;">
            Cancel
          </button>
          <button id="rzp-pay-btn" class="rzp-btn-hover" style="background: #2563eb; color: #ffffff; border: none; font-weight: 700; padding: 10px 28px; border-radius: 8px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(37,99,235,0.35);">
            <span>🔒 Complete Payment (₹${amountInRupees})</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalWrapper);

    // Switch Tabs Logic
    const tabs = ['upi', 'card', 'net', 'wallet'];
    tabs.forEach((tab) => {
      const tabEl = document.getElementById(`tab-${tab}`);
      const panelEl = document.getElementById(`panel-${tab}`);
      if (tabEl && panelEl) {
        tabEl.addEventListener('click', () => {
          tabs.forEach((t) => {
            document.getElementById(`tab-${t}`)?.classList.remove('active');
            const p = document.getElementById(`panel-${t}`);
            if (p) p.style.display = 'none';
          });
          tabEl.classList.add('active');
          panelEl.style.display = 'block';
        });
      }
    });

    // Cancel Button
    document.getElementById('rzp-cancel-btn')?.addEventListener('click', () => {
      modalWrapper.remove();
      if (options.modal?.ondismiss) {
        options.modal.ondismiss();
      }
    });

    // Close on background backdrop click
    modalWrapper.addEventListener('click', (e) => {
      if (e.target === modalWrapper) {
        modalWrapper.remove();
        if (options.modal?.ondismiss) {
          options.modal.ondismiss();
        }
      }
    });

    // Pay Button
    const payBtn = document.getElementById('rzp-pay-btn');
    if (payBtn) {
      payBtn.addEventListener('click', () => {
        payBtn.setAttribute('disabled', 'true');
        payBtn.style.opacity = '0.75';
        payBtn.style.cursor = 'wait';
        payBtn.innerHTML = `<span>⏳ Authorizing Payment...</span>`;

        setTimeout(() => {
          modalWrapper.remove();
          // Invoke Razorpay Success Handler with simulated credentials
          if (options.handler) {
            options.handler({
              razorpay_payment_id: `pay_sim_${Date.now()}`,
              razorpay_order_id: options.order_id,
              razorpay_signature: 'sim_signature',
            });
          }
        }, 800);
      });
    }
  }
}
