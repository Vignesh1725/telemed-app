import { createContext, useContext, useState } from 'react';

export const RecipientContext = createContext();

export const RecipientProvider = ({ children }) => {
    const [recipientId, setRecipientId] = useState(null);

    return (
        <RecipientContext.Provider value={{ recipientId, setRecipientId }}>
            {children}
        </RecipientContext.Provider>
    )
}

export const useRecipientId = () => useContext(RecipientContext);