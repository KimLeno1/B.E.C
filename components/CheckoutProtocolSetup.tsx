import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckoutProtocol, UserPreferences } from '../types';
import { databaseService } from '../services/databaseService';

const REGIONS = [
  { id: 'accra', name: 'Greater Accra', icon: '🏛️', cities: ['Accra', 'Tema', 'Madina', 'Adenta', 'Ashaiman'] },
  { id: 'ashanti', name: 'Ashanti', icon: '🏺', cities: ['Kumasi', 'Obuasi', 'Ejisu', 'Konongo', 'Mampong'] },
  { id: 'western', name: 'Western', icon: '⚓', cities: ['Sekondi-Takoradi', 'Tarkwa', 'Axim', 'Elubo'] },
  { id: 'central', name: 'Central', icon: '🏰', cities: ['Cape Coast', 'Winneba', 'Kasoa', 'Saltpond'] },
  { id: 'eastern', name: 'Eastern', icon: '⛰️', cities: ['Koforidua', 'Nkawkaw', 'Nsawam', 'Akosombo'] },
  { id: 'northern', name: 'Northern', icon: '🕌', cities: ['Tamale', 'Yendi', 'Savelugu'] },
  { id: 'volta', name: 'Volta', icon: '🌊', cities: ['Ho', 'Hohoe', 'Kpando', 'Aflao'] },
  { id: 'bono', name: 'Bono', icon: '🌳', cities: ['Sunyani', 'Berekum', 'Dormaa Ahenkro'] },
  { id: 'bono-east', name: 'Bono East', icon: '🌽', cities: ['Techiman', 'Kintampo', 'Nkoranza'] },
  { id: 'ahafo', name: 'Ahafo', icon: '💎', cities: ['Goaso', 'Mim', 'Bechem'] },
  { id: 'upper-east', name: 'Upper East', icon: '🌞', cities: ['Bolgatanga', 'Bawku', 'Navrongo'] },
  { id: 'upper-west', name: 'Upper West', icon: '🏹', cities: ['Wa', 'Jirapa', 'Tumu'] },
  { id: 'savannah', name: 'Savannah', icon: '🐘', cities: ['Damongo', 'Buipe', 'Salaga'] },
  { id: 'north-east', name: 'North East', icon: '🛡️', cities: ['Nalerigu', 'Gambaga', 'Walewale'] },
  { id: 'oti', name: 'Oti', icon: '🛶', cities: ['Dambai', 'Jasikan', 'Nkwanta'] },
  { id: 'western-north', name: 'Western North', icon: '🌲', cities: ['Sefwi Wiawso', 'Enchi', 'Bibiani'] }
];

interface Props {
  userId: string;
  onComplete: (prefs: UserPreferences) => void;
  onSkip: (prefs: UserPreferences) => void;
}

export const CheckoutProtocolSetup: React.FC<Props> = ({ userId, onComplete, onSkip }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    region: '',
    city: ''
  });

  React.useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await databaseService.getProtocolSession('checkout');
        if (session) {
          setStep(session.currentStep);
          setFormData(prev => ({ ...prev, ...session.sessionData }));
        }
      } catch (e) {
        console.warn('Failed to load checkout session', e);
      }
    };
    loadSession();
  }, []);

  const saveSession = async (currentStep: number) => {
    try {
      await databaseService.saveProtocolSession('checkout', currentStep, formData);
    } catch (e) {
      console.warn('Failed to save checkout session', e);
    }
  };

  const availableCities = REGIONS.find(r => r.name === formData.region)?.cities || [];

  const handleNext = async () => {
    if (step === 0) {
      if (!formData.region || !formData.city) {
        toast.error('Region and City are required.');
        return;
      }
      const nextStep = 1;
      setStep(nextStep);
      saveSession(nextStep);
    } else {
      if (!formData.name || !formData.phone || !formData.address) {
        toast.error('All address fields are required.');
        return;
      }

      try {
        const protocol: CheckoutProtocol = {
          id: `proto_${Date.now()}`,
          ...formData
        };
        await databaseService.saveUserLogistics(userId, [protocol]);
        await databaseService.deleteProtocolSession('checkout');

        const prefs = (await databaseService.getUserPreferences(userId)) || { userId, preferredCategories: [], preferredGenders: [] };
        const updatedPrefs = { ...prefs, checkoutProtocolCompleted: true, userId };
        await databaseService.saveUserPreferences(userId, updatedPrefs);

        toast.success('Delivery address saved for Nationwide Delivery.');
        onComplete(updatedPrefs);
      } catch {
        toast.error('Failed to save address. Try again.');
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      saveSession(prevStep);
    }
  };

  const handleSkip = async () => {
    try {
      await databaseService.deleteProtocolSession('checkout');
      const prefs = (await databaseService.getUserPreferences(userId)) || { userId, preferredCategories: [], preferredGenders: [] };
      const updatedPrefs = { ...prefs, checkoutProtocolCompleted: true, userId };
      await databaseService.saveUserPreferences(userId, updatedPrefs);
      onSkip(updatedPrefs);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E0F06]/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative max-w-2xl w-full bg-[#FAF4EC] border border-[#EAD8C0] p-6 md:p-10 rounded-[2.5rem] shadow-2xl overflow-hidden text-[#3B2010]"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-5xl font-serif italic text-[#3B2010] tracking-tighter">
            Delivery Location
          </h2>
          <p className="text-[10px] md:text-xs font-black text-[#8C532B] uppercase tracking-[0.3em] mt-2">
            B.E.C Footwear • Nationwide Delivery Ghana
          </p>
        </div>

        {step === 0 ? (
          <div className="space-y-6">
            <h3 className="text-sm font-black text-[#5A331C] uppercase tracking-widest text-center">
              Select Your Region
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-2">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setFormData({ ...formData, region: r.name, city: '' })}
                  className={`p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 group ${
                    formData.region === r.name
                      ? 'bg-[#4A2B18] border-[#4A2B18] text-[#FAF4EC] shadow-lg'
                      : 'bg-white border-[#EAD8C0] hover:border-[#8C532B] text-[#3B2010]'
                  }`}
                >
                  <span className={`text-xl transition-all ${formData.region === r.name ? 'scale-110' : 'opacity-75 group-hover:opacity-100'}`}>
                    {r.icon}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase text-center tracking-wider transition-colors ${
                      formData.region === r.name ? 'text-[#FAF4EC]' : 'text-[#5A331C]'
                    }`}
                  >
                    {r.name}
                  </span>
                </button>
              ))}
            </div>

            {formData.region && (
              <div className="space-y-4 animate-in fade-in pt-4">
                <label className="text-[10px] font-black text-[#8C532B] uppercase tracking-widest px-2">
                  Select City
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => setFormData({ ...formData, city })}
                      className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                        formData.city === city
                          ? 'bg-[#4A2B18] text-[#FAF4EC] border-[#4A2B18] shadow-lg'
                          : 'bg-white border-[#EAD8C0] text-[#5A331C] hover:border-[#8C532B]'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-sm font-black text-[#5A331C] uppercase tracking-widest text-center">
              Recipient Contact &amp; Landmark
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="FULL NAME"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-[#EAD8C0] focus:border-[#4A2B18] p-4 rounded-2xl text-xs font-bold text-[#3B2010] placeholder-[#8C532B]/50 outline-none transition-all"
              />
              <input
                type="text"
                placeholder="PHONE NUMBER (e.g. 024 123 4567)"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white border border-[#EAD8C0] focus:border-[#4A2B18] p-4 rounded-2xl text-xs font-bold text-[#3B2010] placeholder-[#8C532B]/50 outline-none transition-all"
              />
              <textarea
                placeholder="DELIVERY ADDRESS / LANDMARK"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-white border border-[#EAD8C0] focus:border-[#4A2B18] p-4 rounded-2xl text-xs font-bold text-[#3B2010] placeholder-[#8C532B]/50 outline-none h-24 transition-all"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-10">
          {step > 0 ? (
            <button
              onClick={handleBack}
              className="text-[10px] font-black text-[#8C532B] uppercase tracking-widest hover:text-[#3B2010] transition-all"
            >
              Back
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="text-[10px] font-black text-[#8C532B] uppercase tracking-widest hover:text-[#3B2010] transition-all"
            >
              Skip
            </button>
          )}

          <button
            onClick={handleNext}
            className="bg-[#4A2B18] text-[#FAF4EC] px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#3B2010] hover:scale-[1.02] transition-all shadow-lg"
          >
            {step === 0 ? 'Next' : 'Save Address'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
