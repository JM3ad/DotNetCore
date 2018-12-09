using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MeadBros.Models;
using Microsoft.AspNetCore.SignalR;

namespace MeadBros.Hubs
{
    public class DeceptionHub : GameHub<DeceptionGame, DeceptionPlayer>
    {
        public Task StartGame(string lobby)
        {
            groupCount[lobby].GenerateGame();
            Clients.Group(lobby).SendAsync("GameStarted", lobby);
            return SendPlayerDetails(lobby);
        }

        public Task SendPlayerDetails(string lobby)
        {
            var game = groupCount[lobby];
            foreach(DeceptionPlayer player in game.players)
            {
                Clients.Client(player.ConnectionId).SendAsync("ReceiveDetails", player.IsUndercover);
            }
            return SendPlayerHints(lobby);
        }

        public Task ReceiveVote(string lobby, Direction direction)
        {
            var game = groupCount[lobby];
            game.players.Where(p => p.ConnectionId == Context.ConnectionId).First().Vote = direction;
            if (game.players.All(p => ((DeceptionPlayer) p).Vote != Direction.Unknown))
            {
                return ResolveRound(lobby);
            }
            return Task.CompletedTask;
        }

        public Task ResolveRound(string lobby)
        {
            var game = groupCount[lobby];
            var result = game.GetResultOfVote();
            Clients.Group(lobby).SendAsync("VoteResults", result);
            return SendAmbushResultsAsync(lobby);
        }

        public Task SendAmbushResultsAsync(string lobby)
        {
#if !DEBUG
            Thread.Sleep(5000);
#endif
            var game = groupCount[lobby];
            var success = game.DidDefeatAttack();
            game.StartNextRound();
            Clients.Group(lobby).SendAsync("AmbushResult", success);
            if (!game.IsFinished())
            {
                return SendPlayerHints(lobby);
            }
            return SendGameCompletedState(lobby);
        }

        public Task SendPlayerHints(string lobby)
        {
            var game = groupCount[lobby];
            foreach (var player in game.players)
            {
                Clients.Client(player.ConnectionId).SendAsync("ReceiveHint", game.GetHintForPlayer(player));
            }
            return Task.CompletedTask;
        }

        public Task SendGameCompletedState(string lobby)
        {
            var game = groupCount[lobby];
            return Clients.Group(lobby).SendAsync("GameComplete", game.HaveCaptainsWon());
        }
    }
}
