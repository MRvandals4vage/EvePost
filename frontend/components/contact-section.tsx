import { Mail, Phone, User, Users } from 'lucide-react';

const ContactSection = () => {
  return (
    <section className="py-20 px-6 lg:px-12 bg-neutral-900/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-neutral-800 p-8 rounded-2xl shadow-lg flex items-center">
            <div className="mr-6">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Name</h3>
              <p className="text-gray-300">Ishaan Upponi</p>
            </div>
          </div>
          <div className="bg-neutral-800 p-8 rounded-2xl shadow-lg flex items-center">
            <div className="mr-6">
              <Phone className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Contact Number</h3>
              <p className="text-gray-300">7700986555</p>
            </div>
          </div>
          <div className="bg-neutral-800 p-8 rounded-2xl shadow-lg flex items-center">
            <div className="mr-6">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Batch</h3>
              <p className="text-gray-300">AI2</p>
            </div>
          </div>
          <div className="bg-neutral-800 p-8 rounded-2xl shadow-lg flex items-center">
            <div className="mr-6">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Email</h3>
              <a href="mailto:iu9736@srmist.edu.in" className="text-gray-300 hover:text-primary transition-colors">
                iu9736@srmist.edu.in
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
