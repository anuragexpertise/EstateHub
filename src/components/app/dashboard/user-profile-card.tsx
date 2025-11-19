
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, UserRole } from "@/types";
import { roleDisplayNames } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Building2, Wrench, Shield, Mail, Phone, Hash } from 'lucide-react';
import { useAvatarStore } from "@/hooks/use-avatar-store";
import { useEffect, useState } from "react";

interface UserProfileCardProps {
    user: User;
}

const roleIcons: Record<UserRole, React.ElementType> = {
    'Admin': Shield,
    'Apartment': Building2,
    'Contractor': Wrench,
    'Security': Shield,
};

export function UserProfileCard({ user }: UserProfileCardProps) {
    const { version, newAvatarUrl, lastUpdatedAvatarId } = useAvatarStore();
    const initialAvatar = PlaceHolderImages.find(img => img.id === user.avatarId);
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(initialAvatar?.imageUrl);
    
    useEffect(() => {
        if (lastUpdatedAvatarId === user.avatarId && newAvatarUrl) {
            setCurrentAvatarUrl(newAvatarUrl);
        } else {
            const originalAvatar = PlaceHolderImages.find(img => img.id === user.avatarId);
            setCurrentAvatarUrl(originalAvatar?.imageUrl);
        }
    }, [version, newAvatarUrl, lastUpdatedAvatarId, user.avatarId]);

    const RoleIcon = roleIcons[user.role];

    const renderDetails = () => {
        switch (user.role) {
            case 'Apartment':
                return (
                    <>
                        <div className="flex items-center gap-3">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span>Unit: {user.details?.unit || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>Size: {user.details?.sqft ? `${user.details.sqft} sqft` : 'N/A'}</span>
                        </div>
                    </>
                );
            case 'Contractor':
                return (
                    <div className="flex items-center gap-3">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <span>Service: {user.details?.service || 'N/A'}</span>
                    </div>
                );
            case 'Security':
                 return (
                    <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span>Shift: {user.details?.shift || 'N/A'}</span>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        {currentAvatarUrl && <AvatarImage src={currentAvatarUrl} alt={user.name} />}
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{user.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                           <RoleIcon className="h-4 w-4" /> {roleDisplayNames[user.role]}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2 text-sm text-foreground">
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                    </div>
                    {user.phone && (
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{user.phone}</span>
                        </div>
                    )}
                     {renderDetails()}
                </div>
                <Badge variant="secondary">{user.id}</Badge>
            </CardContent>
        </Card>
    );
}
