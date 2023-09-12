import Seller from "../models/seller.js";
import { sellerValidationSchema } from "../validations/sellerValidaiton.js";


export const addNewSeller = async (req, res) => { 
    try {
        let { 
            firstname,
            lastname,
            email,
            phoneNumber,
            companyName,
            businessAddressCountry,
            businessAddressCity,
            businessStreetAddress,
        } = req.body
        const { error } = sellerValidationSchema.validate(req.body, {
            errors: { label: "key", wrap: { label: false } },
          });
          if (error) {
            res.status(422).send({ message: error.message });
            return;
        }
        
        const existingSeller = await Seller.find().or([
            { email: email }, { companyName: companyName }
        ]);
    
        if (existingSeller.length !== 0) {
          
          res.status(409).json({
            message: `A seller with this email or company name already exists.`
          });
          return;
        }
    
        firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1).toLowerCase();
        lastname = lastname.charAt(0).toUpperCase() + lastname.slice(1).toLowerCase();
    
        const newSeller = {
            firstname,
            lastname,
            phoneNumber,
            email,
            companyName,
            businessAddress: {
                country: businessAddressCountry,
                city: businessAddressCity,
                streetAddress: businessStreetAddress,
            }
    
        }
    
        const savedSeller = await Seller.create(newSeller);
        res.status(201).json(savedSeller)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }

}

export const getAllSellers = async (req, res) => {
    try {
        const allSellers = await Seller.find() 
        if (allSellers.length === 0) { 
            res.status(404).send({ message: "There is no any seller. First add a seller."})    
        }
        res.status(200).json(allSellers)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
    
}


