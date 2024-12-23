import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface HeaderProps {
  user: any;
  signOut: () => void;
}

export const Header = ({ user, signOut }: HeaderProps) => {
  // Get the first and last name from email, or use a default
  const emailName = user.email?.split('@')[0] || '';
  const [firstName, lastName] = emailName.split(/[._-]/).map(part => 
    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  );
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || 'User';
  
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-primary text-center">Hustle Saturday</h1>
      <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="border-2 border-primary">
            <AvatarImage src={user.user_metadata.avatar_url || "https://github.com/shadcn.png"} />
            <AvatarFallback className="bg-primary">
              {firstName?.charAt(0)}{lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-xl text-primary">
              Welcome Back
            </h2>
            <p className="text-sm text-muted-foreground capitalize">{fullName}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => signOut()}
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Trophy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};