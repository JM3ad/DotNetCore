using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MeadBros.Models;
using Microsoft.AspNetCore.SignalR;

namespace MeadBros.Hubs
{
    public abstract class GameHub<Tgame,Tplayer> : Hub where Tplayer: Player, new() where Tgame : Game<Tplayer>, new()
    {
        protected static Dictionary<string, Tgame> groupCount = new Dictionary<string, Tgame>();

        public Task JoinLobby(string lobby, string playerName)
        {
            if (!groupCount.ContainsKey(lobby))
            {
                return Clients.Caller.SendAsync("FailedJoinLobby", lobby);
            }
            groupCount[lobby].AddPlayer(Context.ConnectionId, playerName);
            Clients.Caller.SendAsync("JoinedLobby", lobby);
            return Groups.AddToGroupAsync(Context.ConnectionId, lobby)
                .ContinueWith((a) => UpdatePlayerList(lobby));
        }

        public Task CreateLobby(string playerName)
        {
            var possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var stringChars = new char[6];
            var random = new Random();

            for (int i = 0; i < stringChars.Length; i++)
            {
                stringChars[i] = possibleChars[random.Next(possibleChars.Length)];
            }
            var lobby = new string(stringChars);
            groupCount.Add(lobby, new Tgame() { lobby = lobby });
            return JoinLobby(lobby, playerName);
        }

        public Task LeaveLobby(string lobby)
        {
            if (!groupCount.ContainsKey(lobby))
            {
                return Task.CompletedTask;
            }
            groupCount[lobby].RemovePlayer(Context.ConnectionId);
            if (groupCount[lobby].IsEmpty())
            {
                groupCount.Remove(lobby);
            }
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, lobby)
                .ContinueWith((a) => UpdatePlayerList(lobby));
        }
        
        public Task SendMessage(string message, string lobby)
        {
            return Clients.Group(lobby).SendAsync("ReceiveMessage", message);
        }

        public Task UpdatePlayerList(string lobby)
        {
            var players = groupCount[lobby].players.Select(p => p.Name);
            return Clients.Group(lobby).SendAsync("UpdatedPlayerList", players);
        }
    }
}
