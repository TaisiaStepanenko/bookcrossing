
export enum BookCondition {
    EXCELLENT = 'EXCELLENT',
    GOOD = 'GOOD',
    SATISFACTORY = 'SATISFACTORY',
    POOR = 'POOR'
};

export enum ExchangeMethod {
    MEETING = 'MEETING',      
    DELIVERY = 'DELIVERY',   
    ALL = 'ALL'              
};

export enum BookCover  {
    HARDCOVER = 'HARDCOVER',
    PAPERBACK = 'PAPERBACK',
    SUPER_PAPERBACK = 'SUPER_PAPERBACK'
};

export enum BookStatus  {
    AVAILABLE = 'AVAILABLE',          
    IN_EXCHANGE = 'IN_EXCHANGE',     
    EXCHANGED = 'EXCHANGED'          
};

export enum ExchangeType  {
    EXCHANGE = 'EXCHANGE',    
    FREE = 'FREE'            
};

export enum Place  {
    MY_PLACE = 'MY_PLACE',   
    NEAR = 'NEAR',            
    RUSSIA = 'RUSSIA'         
};


export enum TransferType  {
    REQUEST = 'REQUEST',     
    CURRENT = 'CURRENT',      
    COMPLETED = 'COMPLETED'   
};

export enum TransferStatus  {
    WAITING_RESPONSE = 'WAITING_RESPONSE',           
    CANCELLED = 'CANCELLED',                        
    WAITING_CONFIRMATION = 'WAITING_CONFIRMATION',   
    WAITING_TO_BE_SENT = 'WAITING_TO_BE_SENT',      
    SENT = 'SENT',                                  
    RECEIVED = 'RECEIVED',                          
    COMPLETED_SUCCESS = 'COMPLETED_SUCCESS',         
    COMPLETED_PREMATURELY = 'COMPLETED_PREMATURELY'    
};

export enum OfferType  {
    ONE = 'ONE',      
    TWO = 'TWO',      
    THREE = 'THREE'   
};

export enum MessageType  {
    EXCHANGE = 'EXCHANGE',
    REVIEW =  'REVIEW'  
};

export const STATUS_TABS: Record<TransferStatus, 'NEW' | 'RUNNING' | 'ENDED'> = {
    WAITING_RESPONSE: 'NEW',           
    WAITING_CONFIRMATION: 'NEW',   
    WAITING_TO_BE_SENT: 'RUNNING',      
    SENT: 'RUNNING',                                  
    RECEIVED: 'RUNNING',    
    COMPLETED_PREMATURELY: 'ENDED',    
    COMPLETED_SUCCESS: 'ENDED',         
    CANCELLED: 'ENDED',                        

}


export const BookConditionValues = Object.values(BookCondition);
export const ExchangeMethodValues = Object.values(ExchangeMethod);
export const BookCoverValues = Object.values(BookCover);
export const BookStatusValues = Object.values(BookStatus);
export const ExchangeTypeValues = Object.values(ExchangeType);
export const PlaceValues = Object.values(Place);
export const TransferTypeValues = Object.values(TransferType);
export const TransferStatusValues = Object.values(TransferStatus);
export const OfferTypeValues = Object.values(OfferType);
export const MessageTypeValues = Object.values(MessageType);

