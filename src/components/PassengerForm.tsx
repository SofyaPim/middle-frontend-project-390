import React from "react";
import type { Passenger } from "../types";

interface PassengerFormProps {
  passenger: Passenger;
  index: number;
  onChange: (index: number, field: Partial<Passenger>) => void;   
   errors?: Partial<Record<keyof Passenger, string>>;

}  
export const PassengerForm: React.FC<PassengerFormProps> = ({ passenger, index, onChange,  errors}) => {
  return (
    <div className="passenger-form">
      <h3>Пассажир {index + 1}</h3>
      <div className="passenger-form__fields">
        <label className="passenger-form__field">
          Имя (латницей):
          <input
            type="text"
            
             data-testid={`passenger-${index}-firstName`}
            value={passenger.firstName}
            onChange={(e) => onChange(index, { firstName: e.target.value })}
            className={`passenger-form__input${errors?.firstName ? " passenger-form__input--error" : ""}`}
          />
        {errors?.firstName && <span className="field-error">{errors.firstName}</span>}
        </label>
      
        <label className="passenger-form__field">
          Фамилия:
          <input
            type="text"
           
           data-testid={`passenger-${index}-lastName`}
           value={passenger.lastName}
           onChange={(e) => onChange(index, { lastName: e.target.value })}
           className={`passenger-form__input${errors?.lastName ? " passenger-form__input--error" : ""}`}
           />
           {errors?.lastName && <span className="field-error">{errors.lastName}</span>}
        </label>
      
        <label className="passenger-form__field">
          Дата рождения:
          <input
            type="date"
            
            data-testid={`passenger-${index}-dateOfBirth`}
            value={passenger.dateOfBirth}
            onChange={(e) => onChange(index, { dateOfBirth: e.target.value })}
            className={`passenger-form__input${errors?.dateOfBirth ? " passenger-form__input--error" : ""}`}
            />
            {errors?.dateOfBirth && <span className="field-error">{errors.dateOfBirth}</span>}
        
        </label>
        <label className="passenger-form__field">
          Серия и номер документа:
          <input
            type="text"
            
            data-testid={`passenger-${index}-documentNumber`}
            value={passenger.documentNumber}
             onChange={(e) => onChange(index, { documentNumber: e.target.value })}
            className={`passenger-form__input${errors?.documentNumber ? " passenger-form__input--error" : ""}`}
          />
      {errors?.documentNumber && <span className="field-error">{errors.documentNumber}</span>}
          </label>
      </div>
    </div>
  )
  };