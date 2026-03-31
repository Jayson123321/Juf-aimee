type ChatMessage = { role: "user" | "assistant"; content: string }

export default function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-2xl px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
          isUser
            ? "bg-violet-600 text-white rounded-br-sm"
            : "bg-white text-gray-800 shadow rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
