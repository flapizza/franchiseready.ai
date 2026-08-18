import type { EmailDelivery } from "../models/EmailDelivery";
import type { EmailMessage } from "../models/EmailMessage";

export interface EmailDeliveryService { deliver(message: EmailMessage): Promise<EmailDelivery> }
