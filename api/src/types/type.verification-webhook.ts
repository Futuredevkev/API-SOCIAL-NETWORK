export interface HeadersMP {
  host: string;
  'user-agent': string;
  'content-length': string;
  accept: string;
  'accept-encoding': string;
  'content-type': string;
  newrelic: string;
  traceparent: string;
  tracestate: string;
  'x-forwarded-for': string;
  'x-forwarded-host': string;
  'x-forwarded-proto': 'https';
  'x-request-id': string;
  'x-rest-pool-name': string;
  'x-retry': string;
  'x-signature': string;
  'x-socket-timeout': string;
}

export interface QueryParamsMP {
  'data.id': string;
  type: string;
}

interface PaypalWebhookResource {
  amount: {
    total: string;
    currency: string;
    details: {
      subtotal: string;
      shipping?: string;
      insurance?: string;
      handling_fee?: string;
      shipping_discount?: string;
      discount?: string;
    };
  };
  payment_mode: string;
  create_time: string;
  transaction_fee: {
    currency: string;
    value: string;
  };
  parent_payment: string;
  update_time: string;
  protection_eligibility_type: string;
  application_context: {
    related_qualifiers: { id: string; type: string }[];
  };
  protection_eligibility: string;
  links: { method: string; rel: string; href: string }[];
  id: string;
  state: string;
  invoice_number: string;
  transactions?: Array<{
    amount: {
      total: string;
      currency: string;
      details?: {
        subtotal?: string;
        shipping?: string;
        insurance?: string;
        handling_fee?: string;
        shipping_discount?: string;
        discount?: string;
      };
    };
    invoice_number?: string; 
  }>;
}

export interface PaypalWebhookBody {
  id: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  event_type: string;
  summary: string;
  resource: PaypalWebhookResource;
  links: { href: string; rel: string; method: string }[];
}

export interface BodyWebhookMP {
  action: string;
  api_version: string;
  data: { id: string };
  date_created: string;
  id: string;
  live_mode: boolean;
  type: string;
  user_id: number;
}
