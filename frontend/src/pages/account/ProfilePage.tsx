import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Plus, Trash2, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Address } from '../../types';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address modal / new address state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<Address>({
    full_name: user?.name || '',
    phone: user?.phone || '',
    street_address: '',
    landmark: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500072',
    is_default: false
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name, phone });
      success('Profile updated successfully');
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.full_name || !newAddr.phone || !newAddr.street_address || !newAddr.pincode) {
      error('Please fill all required address fields');
      return;
    }

    const currentAddresses = user?.addresses || [];
    const updatedAddresses = [...currentAddresses, { ...newAddr, id: `addr_${Date.now()}` }];
    try {
      await updateProfile({ addresses: updatedAddresses });
      success('Delivery address added');
      setShowAddAddress(false);
      setNewAddr({
        full_name: user?.name || '',
        phone: user?.phone || '',
        street_address: '',
        landmark: '',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500072',
        is_default: false
      });
    } catch (err: any) {
      error(err.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (addrId?: string) => {
    if (!addrId) return;
    const currentAddresses = user?.addresses || [];
    const updatedAddresses = currentAddresses.filter((a) => a.id !== addrId);
    try {
      await updateProfile({ addresses: updatedAddresses });
      success('Address removed');
    } catch (err: any) {
      error(err.message || 'Failed to remove address');
    }
  };

  return (
    <div className="bg-[#FCFBF9] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
            Account & Saved Addresses
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your personal profile and delivery addresses for quick furniture checkout.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <h2 className="text-base font-bold font-serif text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-800" />
            Personal Details
          </h2>

          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Email Address (Registered)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-3 bg-stone-100 text-stone-500 rounded-xl border border-stone-200 text-xs cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-full bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Saved Delivery Addresses */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-800" />
              Saved Delivery Addresses
            </h2>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {/* New Address Form Modal/Drawer */}
          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4 animate-in fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                New Address Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Recipient Name *"
                    value={newAddr.full_name}
                    onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    placeholder="Contact Phone *"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-stone-200"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Street Address, Flat / House No. *"
                    value={newAddr.street_address}
                    onChange={(e) => setNewAddr({ ...newAddr, street_address: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={newAddr.landmark}
                    onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="PIN Code *"
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="City *"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <select
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-stone-200"
                  >
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          {/* List of Saved Addresses */}
          {user?.addresses && user.addresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-stone-900 block">{addr.full_name}</span>
                    <p className="text-stone-600 line-clamp-2">{addr.street_address}</p>
                    {addr.landmark && <p className="text-stone-500">Landmark: {addr.landmark}</p>}
                    <p className="text-stone-500">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="font-semibold text-stone-800 pt-1">Phone: {addr.phone}</p>
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500 italic">No saved addresses yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
