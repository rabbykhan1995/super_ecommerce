import { useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp } from "lucide-react-native";

const FAQ_DATA = [
  {
    category: "Orders & Payment",
    items: [
      {
        question: "How do I place an order?",
        answer:
          "Simply browse our products, add items to your cart, and proceed to checkout. You can pay using bKash, Nagad, Rocket, or cash on delivery.",
      },
      {
        question: "Can I modify or cancel my order after placing it?",
        answer:
          "Orders can be modified or cancelled within 2 hours of placement. After that, the order enters processing and cannot be changed. Please contact our support team immediately if you need assistance.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept bKash, Nagad, Rocket, Visa, Mastercard, and Cash on Delivery (COD). All online payments are secured with SSL encryption.",
      },
      {
        question: "Is Cash on Delivery available?",
        answer:
          "Yes, COD is available for orders within Dhaka city. For orders outside Dhaka, we require pre-payment via bKash, Nagad, or card.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      {
        question: "How long does delivery take?",
        answer:
          "Inside Dhaka: 1-2 business days. Outside Dhaka: 3-5 business days. You will receive a tracking number once your order is shipped.",
      },
      {
        question: "Do you ship nationwide?",
        answer:
          "Yes, we deliver to all 64 districts across Bangladesh through our trusted courier partners.",
      },
      {
        question: "How can I track my order?",
        answer:
          "Once your order is dispatched, you will receive an SMS and email with a tracking link. You can also track your order from your account dashboard.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 30-day return policy. Items must be unused, in original packaging, and in the same condition you received them. Some categories like perishables and personal care items are non-returnable.",
      },
      {
        question: "How do I request a refund?",
        answer:
          "Contact our support team with your order number and reason for return. Once we receive and inspect the item, your refund will be processed within 5-7 business days.",
      },
      {
        question: "Do I pay for return shipping?",
        answer:
          "If the return is due to a defective or wrong product, we cover the shipping cost. For change-of-mind returns, the customer bears the return shipping fee.",
      },
    ],
  },
  {
    category: "Account & Support",
    items: [
      {
        question: "Do I need an account to place an order?",
        answer:
          "No, you can checkout as a guest. However, creating an account lets you track orders, save addresses, and enjoy a faster checkout experience.",
      },
      {
        question: "How do I contact customer support?",
        answer:
          "You can reach us via the Contact Us page, by phone at +880 1234-567890, or by email at support@example.com. We are available Sunday-Thursday, 9 AM-6 PM.",
      },
      {
        question: "How do I reset my password?",
        answer:
          'Click "Forgot Password" on the login page, enter your registered email, and follow the link sent to your inbox to set a new password.',
      },
    ],
  },
];

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <View className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <Pressable
        onPress={() => setOpen(!open)}
        className="flex-row items-center justify-between px-4 py-4 bg-white"
      >
        <Text className="flex-1 text-sm font-medium text-gray-900 pr-3">{question}</Text>
        {open ? (
          <ChevronUp size={18} color="#9CA3AF" />
        ) : (
          <ChevronDown size={18} color="#9CA3AF" />
        )}
      </Pressable>
      {open && (
        <View className="px-4 pb-4">
          <Text className="text-sm text-gray-500 leading-6">{answer}</Text>
        </View>
      )}
    </View>
  );
}

export default function FaqScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white border-b border-gray-100 px-6 py-10 items-center">
          <Text className="text-xs tracking-widest uppercase text-green-600 font-medium mb-4">
            Help Center
          </Text>
          <Text className="text-3xl font-black text-gray-900 tracking-tight">
            FREQUENTLY ASKED
          </Text>
          <Text className="mt-3 text-gray-500 text-base leading-relaxed text-center">
            Find answers to the most common questions about orders, shipping, returns, and more.
          </Text>
        </View>

        {/* FAQ Content */}
        <View className="px-6 py-8 space-y-10">
          {FAQ_DATA.map((section) => (
            <View key={section.category}>
              <Text className="text-xl font-black text-gray-900 mb-4">
                {section.category}
              </Text>
              {section.items.map((item) => (
                <AccordionItem
                  key={item.question}
                  question={item.question}
                  answer={item.answer}
                />
              ))}
            </View>
          ))}
        </View>

        {/* CTA */}
        <View className="bg-white border-t border-gray-100 py-10 px-6 items-center">
          <Text className="text-xl font-black text-gray-900">
            STILL HAVE QUESTIONS?
          </Text>
          <Text className="mt-2 text-gray-500">
            Our support team is here to help. Reach out anytime.
          </Text>
          <Pressable className="mt-5 bg-gray-900 px-8 py-3 rounded-lg">
            <Text className="text-white text-xs tracking-widest uppercase font-medium">
              Contact Support
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
