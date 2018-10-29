using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace MeadBros.Hubs
{
    public class GameHub : Hub
    {
        public Task JoinLobby(string lobby)
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, lobby);
        }

        public Task LeaveLobby(string lobby)
        {
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, lobby);
        }

        public async Task SendMessage(string message, string lobby)
        {
            await Clients.Group(lobby).SendAsync("ReceiveMessage", message);
        }
    }
}
