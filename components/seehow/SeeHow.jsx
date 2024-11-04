import Link from 'next/link';
import Image from 'next/image';
import img1 from './Estate stickers/house2.png';
import img2 from './Estate stickers/sold.png'
import img3 from './Estate stickers/new-york.png'

export default function SeeHow() {
  const features = [
    {
      title: "Ενοικίαση σπιτιού",
      description: "Με περισσότερα από 35+ φίλτρα και προηγμένη αναζήτηση, το spitinow σας βοηθά να βρείτε εύκολα το σπίτι ή το διαμέρισμα που θα αγαπήσετε.",
      image: img1,
      buttonText: "Βρείτε ενοίκιο",
      link: "/listing-view?type=Rent"
    },
    {
      title: "Αγορά σπιτιού",
      description: "Με πάνω από 10.000+ διαθέσιμα ακίνητα προς πώληση, το spitinow μπορεί να σας βοηθήσει να βρείτε το σπίτι που θέλετε να αποκαλείτε δικό σας.",
      image: img2,
      buttonText: "Βρείτε σπίτι",
      link: "/listing-view?type=Buy"
    },
    {
      title: "Δείτε γειτονιές",
      description: "Με περισσότερες πληροφορίες για τις γειτονιές από οποιαδήποτε άλλη ιστοσελίδα ακινήτων, έχουμε καταγράψει τα χαρακτηριστικά κάθε περιοχής.",
      image: img3,
      buttonText: "Μάθετε περισσότερα",
      link: "/neighborhoods"
    }
  ];

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 [background-image:linear-gradient(90deg,oklch(var(--s))_4%,color-mix(in_oklch,oklch(var(--s)),oklch(var(--er)))_22%,oklch(var(--p))_45%,color-mix(in_oklch,oklch(var(--p)),oklch(var(--a)))_67%,oklch(var(--a))_100.2%)] bg-clip-text text-transparent">
          Δείτε πώς το spitinow μπορεί να βοηθήσει
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-6 group">
              <div className="relative w-32 h-32 transform transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={128}
                  height={128}
                  className="object-contain"
                  priority={index === 0}
                  style={{ background: 'transparent' }}
                />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800">
                {feature.title}
              </h3>
              
              <p className="text-base-content/70 leading-relaxed">
                {feature.description}
              </p>
              
              <Link href={feature.link} className="w-full">
                <button className="btn btn-outline btn-primary hover:bg-primary w-full md:w-auto transition-all duration-300">
                  {feature.buttonText}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}