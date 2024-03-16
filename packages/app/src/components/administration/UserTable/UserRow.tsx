import { Tag, Td, Tr } from "@chakra-ui/react";
import { UserRole } from "@prisma/client";
import { type User } from "@/server/lib/user/user";

const userRoleLabel: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.USER]: "User",
};

export const UserRow = ({ user, isMe }: { user: User; isMe: boolean }) => {
  return (
    <Tr>
      <Td>{user.createdAt.toISOString()}</Td>
      <Td>
        {user.email} {isMe && <Tag>You</Tag>}
      </Td>
      <Td>
        <Tag colorScheme={user.role === UserRole.ADMIN ? "red" : "blue"}>
          {userRoleLabel[user.role]}
        </Tag>
      </Td>
    </Tr>
  );
};
