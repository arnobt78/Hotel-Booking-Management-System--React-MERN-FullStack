import { Mail, Lock, User } from "lucide-react";

const IconTest = () => {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Icon Test</h2>
      <div className="flex space-x-4">
        <Mail className="h-6 w-6 text-gray-600" />
        <Lock className="h-6 w-6 text-gray-600" />
        <User className="h-6 w-6 text-gray-600" />
      </div>
      <div className="flex space-x-4">
        <Mail className="h-6 w-6 text-red-500" />
        <Lock className="h-6 w-6 text-blue-500" />
        <User className="h-6 w-6 text-green-500" />
      </div>
    </div>
  );
};

export default IconTest;
