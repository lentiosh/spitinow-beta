'use client';

import { useState } from "react";
import GoogleAddressSearch from "@/components/google/GoogleAddressSearch";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FiHome, FiMapPin, FiAlertCircle } from "react-icons/fi";

const AddListing = () => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const { user } = useUser();
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateAddress = async (address) => {
    const { data } = await supabase
      .from('listing')
      .select('id')
      .eq('address', address)
      .single();
    
    return !data;
  };

  const nextHandler = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const isAddressValid = await validateAddress(selectedAddress.description);
      
      if (!isAddressValid) {
        setError('Η διεύθυνση υπάρχει ήδη στη λίστα.');
        toast.error('Η διεύθυνση υπάρχει ήδη στη λίστα.');
        setIsLoading(false);
        return;
      }

      const { data, error: insertError } = await supabase
        .from('listing')
        .insert([
          { 
            address: selectedAddress.description, 
            coordinates: selectedAddress.coordinates, 
            createdBy: user?.primaryEmailAddress.emailAddress 
          },
        ])
        .select();
      
      if (insertError) {
        throw insertError;
      }

      if (data) {
        toast.success("Η νέα διεύθυνση προστέθηκε επιτυχώς στη λίστα!");
        router.replace('/edit-listing/' + data[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.code === '23505') {
        setError('Η διεύθυνση υπάρχει ήδη στη λίστα.');
        toast.error('Η διεύθυνση υπάρχει ήδη στη λίστα.');
      } else {
        setError('Σφάλμα από τον διακομιστή. Παρακαλώ δοκιμάστε ξανά.');
        toast.error('Σφάλμα από τον διακομιστή. Παρακαλώ δοκιμάστε ξανά.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-300 flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Hero section with glass effect */}
          <div className="hero bg-base-200 rounded-xl mb-8 p-6 backdrop-blur-lg bg-opacity-90">
            <div className="hero-content text-center">
              <div>
                <h1 className="text-4xl font-bold flex items-center justify-center gap-3 text-primary">
                  <FiHome className="inline-block" />
                  <span>Προσθήκη Νέας Διεύθυνσης</span>
                </h1>
                <p className="py-4 text-lg text-base-content/80">
                  Παρακαλούμε εισάγετε τη διεύθυνση της ιδιοκτησίας που θέλετε να προσθέσετε.
                </p>
              </div>
            </div>
          </div>

          {/* Address input section */}
          <div className="form-control w-full">
            <div className="relative">
              <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/50" />
              <GoogleAddressSearch 
                selectedAddress={(value) => {
                  setSelectedAddress(value);
                  setError(null);
                }}
                inputValue={inputValue}
                setInputValue={setInputValue}
                inputClassName={`input input-bordered w-full pl-12 pr-4 py-3 text-lg ${
                  error ? 'input-error' : ''
                }`}
                placeholder="Εισάγετε Διεύθυνση"
              />
            </div>

            {/* Error alert */}
            {error && (
              <div className="alert alert-error mt-4">
                <FiAlertCircle />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            disabled={!selectedAddress || !selectedAddress.coordinates || isLoading}
            onClick={nextHandler}
            className={`btn btn-primary w-full mt-6 ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner"></span>
                Επεξεργασία...
              </>
            ) : (
              'Επόμενο'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddListing;
