import { X, Building2, Globe, Users, MapPin, Mail, User, FileText, ExternalLink, Facebook, Instagram, Linkedin } from 'lucide-react';
import { Form } from '../types/form';
import { AddressMap } from './AddressMap';

interface FormDetailsModalProps {
  form: Form;
  onClose: () => void;
}

export function FormDetailsModal({ form, onClose }: FormDetailsModalProps) {
  const defaultPresentationUrl = "https://docs.google.com/presentation/d/1i0qkY3gEH4bxowOFbwiuMtHO4xJLtazzR3UUnolF7SE/edit?usp=share_link";
  const presentationUrl = form.presentationUrl || defaultPresentationUrl;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {form.logoUrl ? (
                <img 
                  src={form.logoUrl} 
                  alt={`${form.companyName} logo`}
                  className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{form.companyName}</h2>
                <p className="text-sm text-gray-500">Created on {new Date(form.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Company Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Company Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID Number</label>
                    <p className="mt-1 text-gray-900">{form.idNumber}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      Website
                    </label>
                    <a 
                      href={form.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-teal-600 hover:text-teal-700"
                    >
                      {form.website}
                    </a>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Main Activity</label>
                    <p className="mt-1 text-gray-900">{form.mainActivity}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Sub Activities</label>
                    <p className="mt-1 text-gray-900">{form.subActivities}</p>
                  </div>

                  {(form.facebookUrl || form.instagramUrl || form.linkedinUrl) && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Social Media</label>
                      <div className="mt-1 space-y-2">
                        {form.facebookUrl && (
                          <a
                            href={form.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-teal-600 hover:text-teal-700"
                          >
                            <Facebook className="h-4 w-4 mr-2" />
                            Facebook
                          </a>
                        )}
                        {form.instagramUrl && (
                          <a
                            href={form.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-teal-600 hover:text-teal-700"
                          >
                            <Instagram className="h-4 w-4 mr-2" />
                            Instagram
                          </a>
                        )}
                        {form.linkedinUrl && (
                          <a
                            href={form.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-teal-600 hover:text-teal-700"
                          >
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {form.lastGoogleReview && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Google Review</label>
                      <p className="mt-1 text-gray-900">
                        {new Date(form.lastGoogleReview).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Employees
                      </label>
                      <p className="mt-1 text-gray-900">{form.employeeCount}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Sites</label>
                      <p className="mt-1 text-gray-900">{form.siteCount}</p>
                    </div>
                  </div>

                  <div>
                    <a
                      href={presentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Presentation
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Decision Maker
                    </label>
                    <p className="mt-1 text-gray-900">{form.decisionMaker}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </label>
                    <a 
                      href={`mailto:${form.clientEmail}`}
                      className="mt-1 text-teal-600 hover:text-teal-700"
                    >
                      {form.clientEmail}
                    </a>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Address
                    </label>
                    <p className="mt-1 text-gray-900">{form.clientAddress}</p>
                  </div>

                  {form.coordinates && (
                    <div className="mt-4">
                      <AddressMap 
                        address={form.clientAddress}
                        coordinates={{
                          lat: parseFloat(form.coordinates.lat),
                          lon: parseFloat(form.coordinates.lon)
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}