using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeadBros.Models
{
    public enum Direction
    {
        Unknown,
        North,
        East,
        South,
        West
    }

    public class DeceptionPlayer
    {
        public string Name { get; set; }
        public string connectionId { get; private set; }
        public bool IsUndercover { get; set; }
        public Direction Vote { get; set; }

        public DeceptionPlayer(string connectionId)
        {
            this.connectionId = connectionId;
        }
    }
}
