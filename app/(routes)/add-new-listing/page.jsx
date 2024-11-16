'use client';

import { useState } from "react";
import GoogleAddressSearch from "@/components/google/GoogleAddressSearch";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MapPin, ChevronLeft, Search } from "lucide-react";

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
      
      if (insertError) throw insertError;

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
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center px-4 py-4 md:px-8 md:py-6 max-w-screen-lg mx-auto">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-900">
            Προσθέστε το κατάλυμά σας
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pb-24 md:pb-0">
        <div className="px-6 py-8 md:px-20 md:py-12 lg:px-40 lg:py-16 max-w-screen-md mx-auto">
          <div className="space-y-6">
            {/* Welcome Text */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                Πού βρίσκεται το κατάλυμά σας;
              </h2>
              <p className="text-md md:text-lg text-gray-600">
                Η διεύθυνσή σας κοινοποιείται μόνο στους επισκέπτες αφού κάνουν κράτηση.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative mt-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <GoogleAddressSearch 
                  selectedAddress={(value) => {
                    setSelectedAddress(value);
                    setError(null);
                  }}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  inputClassName={`w-full pl-12 pr-4 py-3 text-base border ${
                    error ? 'border-red-500' : 'border-gray-300'
                  } rounded-full shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500`}
                  placeholder="Εισάγετε τη διεύθυνσή σας"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Action Button */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-sm">
        <div className="max-w-screen-md mx-auto">
          <button
            disabled={!selectedAddress || !selectedAddress.coordinates || isLoading}
            onClick={nextHandler}
            className={`w-full py-3 px-6 text-base font-medium rounded-full text-white 
              ${!selectedAddress || isLoading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
              } transition-all duration-200`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Επεξεργασία...</span>
              </div>
            ) : (
              'Συνέχεια'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddListing;