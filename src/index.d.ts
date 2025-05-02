interface MenuItem {
    name: string;
    price: number;
    status: boolean;
}

interface ProfileInformation {
  phoneNumber: string| null;
  address: string| null;
  description: string| null;
};

interface Menu{
    name:MenuItem,
}

interface LinkedUsers {
    email:{
        name:string,
        email:string
    },
}

interface linkedUser{
    name:string,
    email:string,
}

interface User{
    name:string,
    email:string,
    photo:URL,
}