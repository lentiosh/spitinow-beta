'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { supabase } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import FileUpload from '../_components/FileUpload';

const EditListing = ({ params }) => {
  const router = useRouter();
  const { user } = useUser();
  const listingId = params.id;
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const verifyAndFetchListing = async () => {
      if (!user) {
        router.replace('/sign-in');
        return;
      }

      const { data, error } = await supabase
        .from('listing')
        .select('*,listingImages(listing_id,url)')
        .eq('id', listingId)
        .eq('createdBy', user.primaryEmailAddress.emailAddress)
        .single();

      if (error || !data) {
        console.error('Σφάλμα επαλήθευσης ιδιοκτησίας:', error);
        router.replace('/');
      } else {
        setInitialValues({
          type: data.type || 'Rent',
          propertyType: data.propertyType || '',
          bedrooms: data.bedrooms || '',
          bathrooms: data.bathrooms || '',
          builtIn: data.builtIn || '',
          parking: data.parking || '',
          lotSize: data.lotSize || '',
          area: data.area || '',
          price: data.price || '',
          hoa: data.hoa || '',
          description: data.description || '',
          floor_number: data.floor_number || '',
          total_floors: data.total_floors || '',
          furnishing: data.furnishing || '',
          heating_cooling: data.heating_cooling || '',
          garden: data.garden || false,
          pool: data.pool || false,
          view: data.view || '',
          energy_efficiency: data.energy_efficiency || '',
          solar_panels: data.solar_panels || false,
          pets_allowed: data.pets_allowed || false,
          property_taxe: data.property_taxe || '',
          neighborhood: data.neighborhood || '',
          nearby_amenities: data.nearby_amenities || '',
          available_from: data.available_from || '',
          availability_duration: data.availability_duration || '',
        });
        setLoading(false);
      }
    };

    if (user && listingId) {
      verifyAndFetchListing();
    }
  }, [user, listingId, router]);

  const propertyTypes = [
    'Διαμέρισμα',
    'Σπίτι',
    'Μεζονέτα',,
    'Γκαρσονιέρα',
    'Σοφίτα',
    'Βίλα',
    'Ρετιρέ',
  ];

  const validationSchema = Yup.object({
    type: Yup.string().required('Υποχρεωτικό'),
    propertyType: Yup.string().required('Υποχρεωτικό'),
    bedrooms: Yup.number()
      .required('Υποχρεωτικό')
      .min(0, 'Δεν μπορεί να είναι αρνητικό')
      .integer('Πρέπει να είναι ακέραιος'),
    bathrooms: Yup.number()
      .required('Υποχρεωτικό')
      .min(0, 'Δεν μπορεί να είναι αρνητικό')
      .integer('Πρέπει να είναι ακέραιος'),
    builtIn: Yup.number()
      .nullable()
      .min(0, 'Δεν μπορεί να είναι αρνητικό')
      .integer('Πρέπει να είναι ακέραιος'),
    parking: Yup.number()
      .nullable()
      .min(0, 'Δεν μπορεί να είναι αρνητικό')
      .integer('Πρέπει να είναι ακέραιος'),
    lotSize: Yup.number()
      .nullable()
      .min(0, 'Δεν μπορεί να είναι αρνητικό'),
    area: Yup.number()
      .nullable()
      .min(0, 'Δεν μπορεί να είναι αρνητικό'),
    price: Yup.number()
      .required('Υποχρεωτικό')
      .min(0, 'Δεν μπορεί να είναι αρνητικό'),
    hoa: Yup.number()
      .nullable()
      .min(0, 'Δεν μπορεί να είναι αρνητικό'),
    description: Yup.string().nullable(),
    floor_number: Yup.number().nullable().min(0),
    total_floors: Yup.number().nullable().min(0),
    furnishing: Yup.string().nullable(),
    heating_cooling: Yup.string().nullable(),
    garden: Yup.boolean().nullable(),
    pool: Yup.boolean().nullable(),
    view: Yup.string().nullable(),
    energy_efficiency: Yup.string().nullable(),
    solar_panels: Yup.boolean().nullable(),
    pets_allowed: Yup.boolean().nullable(),
    property_taxe: Yup.number().nullable().min(0),
    neighborhood: Yup.string().nullable(),
    nearby_amenities: Yup.string().nullable(),
    available_from: Yup.date().nullable(),
    availability_duration: Yup.string().nullable(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    const updatedValues = {
      ...values,
      builtIn: values.builtIn === '' ? null : values.builtIn,
      available_from: values.available_from === '' ? null : values.available_from,
      bedrooms: values.bedrooms === '' ? null : values.bedrooms,
      bathrooms: values.bathrooms === '' ? null : values.bathrooms,
      parking: values.parking === '' ? null : values.parking,
      lotSize: values.lotSize === '' ? null : values.lotSize,
      area: values.area === '' ? null : values.area,
      price: values.price === '' ? null : values.price,
      hoa: values.hoa === '' ? null : values.hoa,
      floor_number: values.floor_number === '' ? null : values.floor_number,
      total_floors: values.total_floors === '' ? null : values.total_floors,
      property_taxe: values.property_taxe === '' ? null : values.property_taxe,
    };

    try {
      const { data: updateData, error: updateError } = await supabase
        .from('listing')
        .update(updatedValues)
        .eq('id', listingId)
        .eq('createdBy', user.primaryEmailAddress.emailAddress)
        .select();

      if (updateError) {
        console.error('Σφάλμα ενημέρωσης καταχώρησης:', updateError);
        toast.error('Σφάλμα ενημέρωσης καταχώρησης');
        setSubmitting(false);
        return;
      }

      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${listingId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listingImages')
          .upload(filePath, image, {
            contentType: image.type,
          });

        if (uploadError) {
          console.error('Σφάλμα μεταφόρτωσης εικόνας:', uploadError);
          toast.error('Σφάλμα κατά τη μεταφόρτωση εικόνων');
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('listingImages')
            .getPublicUrl(filePath);

          const imageUrl = publicUrlData.publicUrl;

          const { error: insertError } = await supabase
            .from('listingImages')
            .insert({
              listing_id: listingId,
              url: imageUrl,
            });

          if (insertError) {
            console.error('Σφάλμα εισαγωγής URL εικόνας:', insertError);
            toast.error('Σφάλμα αποθήκευσης URL εικόνας');
          }
        }
      }

      toast.success('Η καταχώρησή σας ενημερώθηκε');
    } catch (error) {
      console.error('Απρόσμενο σφάλμα:', error);
      toast.error('Παρουσιάστηκε ένα απρόσμενο σφάλμα');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !initialValues) {
   <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md mt-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Επεξεργασία Στοιχείων Ακινήτου
      </h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Τύπος
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center text-gray-700">
                  <Field
                    type="radio"
                    name="type"
                    value="Rent"
                    className="form-radio h-4 w-4 text-[#34e0a1]"
                  />
                  <span className="ml-2">Ενοικίαση</span>
                </label>
                <label className="flex items-center text-gray-700">
                  <Field
                    type="radio"
                    name="type"
                    value="Sell"
                    className="form-radio h-4 w-4 text-[#34e0a1]"
                  />
                  <span className="ml-2">Πώληση</span>
                </label>
              </div>
              <ErrorMessage
                name="type"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Τύπος Ακινήτου
              </label>
              <Field
                as="select"
                name="propertyType"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              >
                <option value="">Επιλέξτε Τύπο Ακινήτου</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="propertyType"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Υπνοδωμάτια
              </label>
              <Field
                type="number"
                name="bedrooms"
                placeholder="Αριθμός υπνοδωματίων"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
              <ErrorMessage
                name="bedrooms"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Μπάνια
              </label>
              <Field
                type="number"
                name="bathrooms"
                placeholder="Αριθμός μπάνιων"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
              <ErrorMessage
                name="bathrooms"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Έτος Κατασκευής
              </label>
              <Field
                type="number"
                name="builtIn"
                placeholder="Έτος κατασκευής του ακινήτου"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
              <ErrorMessage
                name="builtIn"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Θέσεις Στάθμευσης
              </label>
              <Field
                type="number"
                name="parking"
                placeholder="Αριθμός θέσεων στάθμευσης"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Μέγεθος Οικοπέδου (τ.μ.)
              </label>
              <Field
                type="number"
                name="lotSize"
                placeholder="Μέγεθος οικοπέδου σε τετραγωνικά μέτρα"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
              <ErrorMessage
                name="lotSize"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Εμβαδόν (τ.μ.)
              </label>
              <Field
                type="number"
                name="area"
                placeholder="Εμβαδόν ακινήτου σε τετραγωνικά μέτρα"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
              <ErrorMessage
                name="area"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Τιμή (€)
              </label>
              <Field
                type="number"
                name="price"
                placeholder="Τιμή σε ευρώ"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
              <ErrorMessage
                name="price"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Κοινόχρηστα (€)
              </label>
              <Field
                type="number"
                name="hoa"
                placeholder="Μηνιαία κοινόχρηστα σε ευρώ"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
              <ErrorMessage
                name="hoa"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Όροφος
              </label>
              <Field
                type="number"
                name="floor_number"
                placeholder="Αριθμός ορόφου"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
              <ErrorMessage
                name="floor_number"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Σύνολο Ορόφων
              </label>
              <Field
                type="number"
                name="total_floors"
                placeholder="Συνολικός αριθμός ορόφων"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
              <ErrorMessage
                name="total_floors"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Επίπλωση
              </label>
              <Field
                as="select"
                name="furnishing"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              >
                <option value="">Επιλέξτε Επίπλωση</option>
                <option value="Επιπλωμένο">Επιπλωμένο</option>
                <option value="Μη Επιπλωμένο">Μη Επιπλωμένο</option>
                <option value="Μερικώς Επιπλωμένο">Μερικώς Επιπλωμένο</option>
              </Field>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Θέρμανση/Ψύξη
              </label>
              <Field
                type="text"
                name="heating_cooling"
                placeholder="Περιγραφή συστήματος θέρμανσης/ψύξης"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Θέα
              </label>
              <Field
                type="text"
                name="view"
                placeholder="Περιγραφή θέας"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ενεργειακή Απόδοση
              </label>
              <Field
                type="text"
                name="energy_efficiency"
                placeholder="Κατηγορία ενεργειακής απόδοσης"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Field
                  type="checkbox"
                  name="garden"
                  className="form-checkbox h-4 w-4 text-[#34e0a1]"
                />
                <span className="ml-2">Κήπος</span>
              </label>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Field
                  type="checkbox"
                  name="pool"
                  className="form-checkbox h-4 w-4 text-[#34e0a1]"
                />
                <span className="ml-2">Πισίνα</span>
              </label>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Field
                  type="checkbox"
                  name="solar_panels"
                  className="form-checkbox h-4 w-4 text-[#34e0a1]"
                />
                <span className="ml-2">Ηλιακοί Συλλέκτες</span>
              </label>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Field
                  type="checkbox"
                  name="pets_allowed"
                  className="form-checkbox h-4 w-4 text-[#34e0a1]"
                />
                <span className="ml-2">Επιτρέπονται Κατοικίδια</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ΕΝΦΙΑ (€)
              </label>
              <Field
                type="number"
                name="property_taxe"
                placeholder="Ετήσιος ΕΝΦΙΑ σε ευρώ"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Περιοχή
              </label>
              <Field
                type="text"
                name="neighborhood"
                placeholder="Όνομα περιοχής"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Κοντινές Παροχές
              </label>
              <Field
                type="text"
                name="nearby_amenities"
                placeholder="Περιγραφή κοντινών παροχών"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Διαθέσιμο Από
              </label>
              <Field
                type="date"
                name="available_from"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Διάρκεια Διαθεσιμότητας
              </label>
              <Field
                type="text"
                name="availability_duration"
                placeholder="π.χ. 12 μήνες"
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Περιγραφή
              </label>
              <Field
                as="textarea"
                name="description"
                placeholder="Αναλυτική περιγραφή του ακινήτου..."
                className="block w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#34e0a1]"
                rows="4"
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Μεταφόρτωση Εικόνων
              </label>
              <FileUpload setImages={setImages} imageList={listingId.listingImages} />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#232323] text-white py-3 rounded-md hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#34e0a1] transition duration-150"
              >
                {isSubmitting ? 'Αποθήκευση...' : 'Αποθήκευση Καταχώρησης'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditListing;