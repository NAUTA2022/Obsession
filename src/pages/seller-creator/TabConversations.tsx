/**
 * TabConversations — uses the exact same SharedInboxPage that the creator sees.
 * The component fetches from chatService.getInbox() and shows delegated seller
 * conversations when the seller's context is active.
 */
import SharedInboxPage from '../../components/chat/SharedInboxPage';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Props {
  username: string;
}

export default function TabConversations(_props: Props) {
  return (
    <div className="h-full min-h-0">
      <SharedInboxPage mode="creator" />
    </div>
  );
}
