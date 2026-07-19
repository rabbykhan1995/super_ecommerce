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
};

export type NavItem = {
    name: string;
    icon: React.ReactNode;
    link?: string;
    subItems?: SubItem[];
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
            },
            {
                name: "Supplier",
                link: "/contact/supplier",
                icon: <Store size={16} />,
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
            },
            {
                name: "Product List",
                link: "/product/list",
                icon: <ListIndentIncrease size={16} />,
            },
            {
                name: "Pos Products",
                link: "/product/pos-products",
                icon: <ListIndentIncrease size={16} />,
            },
            {
                name: "Brand",
                link: "/product/brand",
                icon: <Slack size={16} />,
            },
            {
                name: "Unit",
                link: "/product/unit",
                icon: <Boxes size={16} />,
            },
            {
                name: "Category",
                link: "/product/category",
                icon: <ChartColumnStacked size={16} />,
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
            },
            {
                name: "Purchase List",
                link: "/purchase/list",
                icon: <Table2 size={16} />,
            },
            {
                name: "Purchase Return List",
                link: "/purchase/return-list",
                icon: <ListIndentIncrease size={16} />,
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
            },
               {
                name: "Fifo Sale",
                link: "/sale/fifo-sale",
                icon: <ListIndentIncrease size={16} />,
            },
            {
                name: "Sale List",
                link: "/sale/list",
                icon: <TableCellsMerge size={16} />,
            },
            {
                name: "Sale Return List",
                link: "/sale/return-list",
                icon: <ListIndentIncrease size={16} />,
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
            }, {
                name: "List",
                link: "/damage/list/",
                icon: <Scroll size={16} />,
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
            }, {
                name: "Orders",
                link: "/ecom/orders/",
                icon: <Scroll size={16} />,
            },
            {
                name: "Banners",
                link: "/ecom/banners/",
                icon: <Scroll size={16} />,
            },
            {
                name: "Featured Products",
                link: "/ecom/featured-products/",
                icon: <Scroll size={16} />,
            },
            {
                name: "Flash Sale",
                link: "/ecom/flash-sale/",
                icon: <Scroll size={16} />,
            },
            {
                name: "Flash Products",
                link: "/ecom/flash-products/",
                icon: <Scroll size={16} />,
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
            },
            {
                name: "List",
                link: "/expense/list/",
                icon: <Scroll size={16} />,
            },
            {
                name: "Types",
                link: "/expense/types/",
                icon: <GitFork size={16} />,
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
            },
            {
                name: "List",
                link: "/parcel/list",
                icon: <Scroll size={16} />,
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
            },
            {
                name: "List",
                link: "/quotation/list/sale",
                icon: <Scroll size={16} />,
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
            },
            {
                name: "Generate QR",
                link: "/barcode/qr",
                icon: <QrCodeIcon size={16} />,
            },
        

        ],

    },

];