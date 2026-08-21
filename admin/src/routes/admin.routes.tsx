import {
    LayoutDashboard,
    ShoppingCart,
    Plus,
    Truck,
    ListIndentIncrease,
    Slack,
    Boxes,
    ChartColumnStacked,
    ShoppingBasket,
    CirclePile,
    ShoppingBag,
    BadgeTurkishLira,
    HandPlatter,
    Contact,

    Store,
    Columns3Cog,

    PackageX,
    SquarePlus,
    Scroll,

    Table2,
    TableCellsMerge,

    GitFork,

    Verified,
    Wallet,
    Quote,
    QrCode,
    BarcodeIcon,
    QrCodeIcon
} from "lucide-react";


export type SubItem = {
  name: string;
  link: string;
  icon: React.ReactNode;
  permission?: string;
};


export type NavItem = {
  name: string;
  icon: React.ReactNode;
  link?: string;
  subItems?: SubItem[];
  permission?: string;
};





export const AdminRoutes: NavItem[] = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, link: "/" },
    {
        name: "Contact",
        icon: <Contact size={18} />,
        subItems: [
            {
                name: "Customer",
                link: "/contact/customer",
                icon: <Columns3Cog size={16} />,
                permission: "contact:read",
            },
            {
                name: "Supplier",
                link: "/contact/supplier",
                icon: <Store size={16} />,
                permission: "contact:read",
            },

        ],
    },
    {
        name: "Product",
        icon: <CirclePile size={18} />,
        subItems: [
            {
                name: "New Product",
                link: "/product/new",
                icon: <Plus size={16} />,
                permission: "product:create",
            },
            {
                name: "Product List",
                link: "/product/list",
                icon: <ListIndentIncrease size={16} />,
                permission: "product:read",
            },
            {
                name: "Pos Products",
                link: "/product/pos-products",
                icon: <ListIndentIncrease size={16} />,
                permission: "product:read",
            },
            {
                name: "Brand",
                link: "/product/brand",
                icon: <Slack size={16} />,
                permission: "brand:read",
            },
            {
                name: "Unit",
                link: "/product/unit",
                icon: <Boxes size={16} />,
                permission: "unit:read",
            },
            {
                name: "Category",
                link: "/product/category",
                icon: <ChartColumnStacked size={16} />,
                permission: "category:read",
            },
        ],
    },
    {
        name: "Purchase",
        icon: <ShoppingBag size={18} />,
        subItems: [
            {
                name: "New Purchase",
                link: "/purchase/new",
                icon: <ShoppingBasket size={16} />,
                permission: "purchase:create",
            },
            {
                name: "Purchase List",
                link: "/purchase/list",
                icon: <Table2 size={16} />,
                permission: "purchase:read",
            },
            {
                name: "Purchase Return List",
                link: "/purchase/return-list",
                icon: <ListIndentIncrease size={16} />,
                permission: "purchase-return:read",
            },

        ],
    },
    {
        name: "Sale",
        icon: <ShoppingCart size={18} />,
        subItems: [
            {
                name: "New Sale",
                link: "/sale/new",
                icon: <Store size={16} />,
                permission: "sale:create",
            },
               {
                name: "Fifo Sale",
                link: "/sale/fifo-sale",
                icon: <ListIndentIncrease size={16} />,
                permission: "sale:create",
            },
            {
                name: "Sale List",
                link: "/sale/list",
                icon: <TableCellsMerge size={16} />,
                permission: "sale:read",
            },
            {
                name: "Sale Return List",
                link: "/sale/return-list",
                icon: <ListIndentIncrease size={16} />,
                permission: "sale-return:read",
            },
         
        ],
    },
    {
        name: "Account",
        icon: <BadgeTurkishLira size={18} />,
        subItems: [
            {
                name: "Account",
                link: "/account/",
                icon: <HandPlatter size={16} />,
                permission: "account:read",
            },

        ],
    },
    {
        name: "Damage",
        icon: <PackageX size={18} />,
        subItems: [
            {
                name: "Create",
                link: "/damage/create/",
                icon: <SquarePlus size={16} />,
                permission: "damage:create",
            }, {
                name: "List",
                link: "/damage/list/",
                icon: <Scroll size={16} />,
                permission: "damage:read",
            },

        ],
    },
        {
        name: "Ecommece",
        icon: <PackageX size={18} />,
        subItems: [
            {
                name: "Product List",
                link: "/ecom/product-list/",
                icon: <SquarePlus size={16} />,
                permission: "product:read",
            }, {
                name: "Orders",
                link: "/ecom/orders/",
                icon: <Scroll size={16} />,
                permission: "order:read",
            },
            {
                name: "Banners",
                link: "/ecom/banners/",
                icon: <Scroll size={16} />,
                permission: "banner:read",
            },
            {
                name: "Featured Products",
                link: "/ecom/featured-products/",
                icon: <Scroll size={16} />,
                permission: "featured-product:read",
            },
            {
                name: "Flash Sale",
                link: "/ecom/flash-sale/",
                icon: <Scroll size={16} />,
                permission: "flash-sale:read",
            },
            {
                name: "Flash Products",
                link: "/ecom/flash-products/",
                icon: <Scroll size={16} />,
                permission: "flash-sale:read",
            },
            {
                name: "All Users",
                link: "/ecom/all-users-list/",
                icon: <Scroll size={16} />,
                permission: "user:read",
            }

        ],
    },

    {
        name: "Warranty",
        icon: <Verified size={18} />,
        subItems: [
            {
                name: "Lists",
                link: "/warranty/list/",
                icon: <Scroll size={16} />,
                permission: "warranty:read",
            }

        ],
    },

    {
        name: "Expense",
        icon: <Wallet size={18} />,
        subItems: [
            {
                name: "Create",
                link: "/expense/create/",
                icon: <Plus size={16} />,
                permission: "expense:create",
            },
            {
                name: "List",
                link: "/expense/list/",
                icon: <Scroll size={16} />,
                permission: "expense:read",
            },
            {
                name: "Types",
                link: "/expense/types/",
                icon: <GitFork size={16} />,
                permission: "expense:read",
            }

        ],

    },   {
        name: "Orders",
        icon: <Truck size={18} />,
        subItems: [
            {
                name: "Create",
                link: "/order/create",
                icon: <Plus size={16} />,
                permission: "order:create",
            },
            {
                name: "List",
                link: "/order/list",
                icon: <Scroll size={16} />,
                permission: "order:read",
            }

        ],

    },

       {
        name: "Parcel",
        icon: <Truck size={18} />,
        subItems: [
            {
                name: "Create",
                link: "/parcel/create",
                icon: <Plus size={16} />,
                permission: "parcel:create",
            },
            {
                name: "List",
                link: "/parcel/list",
                icon: <Scroll size={16} />,
                permission: "parcel:read",
            },
                  {
                name: "Pending Parcels",
                link: "/parcel/pending",
                icon: <Scroll size={16} />,
                permission: "parcel:read",
            },

        ],

    },
        

    {
        name: "Quotation",
        icon: <Quote size={18} />,
        subItems: [
            {
                name: "Sale Quotation",
                link: "/quotation/create-sale-quotation",
                icon: <Plus size={16} />,
                permission: "quotation:create",
            },
            {
                name: "List",
                link: "/quotation/list/sale",
                icon: <Scroll size={16} />,
                permission: "quotation:read",
            },
            

        ],

    },
        {
        name: "Barcode Print",
        icon: <QrCode size={18} />,
        subItems: [
                {
                name: "Print Barcode",
                link: "/barcode/barcode",
                icon: <BarcodeIcon size={16} />,
                permission: "product:read",
            },
            {
                name: "Generate QR",
                link: "/barcode/qr",
                icon: <QrCodeIcon size={16} />,
                permission: "product:read",
            },
        

        ],

    },

        {
        name: "HRM",
        icon: <PackageX size={18} />,
        subItems: [
            {
                name: "Stuffs",
                link: "/hrm/stuffs/",
                icon: <SquarePlus size={16} />,
                permission: "user:read",
            },
                {
                name: "Roles",
                link: "/hrm/roles/",
                icon: <SquarePlus size={16} />,
                permission: "role:read",
            }

        ],
    },

];