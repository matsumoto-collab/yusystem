export interface CompanyInfo {
    id: string;
    name: string;
    postalCode: string;
    address: string;
    tel: string;
    fax?: string;
    representative: string;
    sealImage?: string; // Base64 encoded image or URL
    createdAt: Date;
    updatedAt: Date;
}

export interface CompanyInfoInput {
    name: string;
    postalCode: string;
    address: string;
    tel: string;
    fax?: string;
    representative: string;
    sealImage?: string;
}
