export interface VisitorPassRequest {
  eventId: string;
  rsvpId: string;
  visitorName: string;
  visitorPhone?: string;
  vehicleNumber?: string;
  validFrom: Date;
  validUntil: Date;
  societyId?: string;
  apartmentId?: string;
}

export interface VisitorPassData {
  passCode: string;
  visitorName: string;
  eventName: string;
  eventDate: string;
  venue: string;
  guestCount: number;
  qrCodeDataUrl?: string;
  hostName?: string;
}

export interface GateProvider {
  name: string;
  createPass(request: VisitorPassRequest): Promise<GatePassResult>;
  isConfigured(): boolean;
}

export interface GatePassResult {
  success: boolean;
  externalPassId?: string;
  pdfUrl?: string;
  error?: string;
}

// MyGate / NoBrokerHood API payloads (stubbed for future integration)
export interface MyGatePassPayload {
  societyId: string;
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  vehicleNumber?: string;
  validFrom: string;
  validUntil: string;
  flatId?: string;
}

export interface NoBrokerHoodPassPayload {
  societyId: string;
  visitorName: string;
  phone: string;
  expectedArrival: string;
  vehicleNumber?: string;
}
