import React from "react";
import type { Passenger } from "../types";

interface PassengerFormProps {
  passenger: Passenger;
  index: number;
  onChange: (index: number, field: Partial<Passenger>) => void;   

}  
export const PassengerForm: React.FC<PassengerFormProps> = ({ passenger, index, onChange }) => {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
      <h3>Пассажир {index + 1}</h3>
      <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
        <label style={{display:'flex', flexDirection:'column' , gap:'4px'}}>
          Имя (латницей):
          <input
            type="text"
            required
             data-testid={`passenger-${index}-firstName`}
            value={passenger.firstName}
            onChange={(e) => onChange(index, { firstName: e.target.value })}
            style={{padding:'6px', borderRadius: '4px', border: '1px solid #ccc'}}
          />
        </label>
      
        <label style={{display:'flex', flexDirection:'column' , gap:'4px'}}>
          Фамилия:
          <input
            type="text"
           required
           data-testid={`passenger-${index}-lastName`}
           value={passenger.lastName}
           onChange={(e) => onChange(index, { lastName: e.target.value })}
           style={{padding:'6px', borderRadius: '4px', border: '1px solid #ccc'}}
          />
        </label>
      
        <label style={{display:'flex', flexDirection:'column' , gap:'4px'}}>
          Дата рождения:
          <input
            type="date"
            required
            data-testid={`passenger-${index}-dob`}
            value={passenger.dateOfBirth}
            onChange={(e) => onChange(index, { dateOfBirth: e.target.value })}
            style={{padding:'6px', borderRadius: '4px', border: '1px solid #ccc'}}
          />
        
        </label>
        
        <label style={{display:'flex', flexDirection:'column' , gap:'4px'}}>
          Серия и номер документа:
          <input
            type="text"
            required
            data-testid={`passenger-${index}-document`}
            value={passenger.documentNumber}
             onChange={(e) => onChange(index, { documentNumber: e.target.value })}
            style={{padding:'6px', borderRadius: '4px', border: '1px solid #ccc'}}
          />
          </label>
       
      </div>
    </div>
  )
  };